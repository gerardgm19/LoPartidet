using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Models.Enums;
using LoPartidet.API.Services.Interfaces;
using LoPartidet.API.Services.Validators;
using LoPartidet.API.Services.Validators.Interfaces;
using LoPartidet.API.Services.Validators.Models;
using Microsoft.EntityFrameworkCore;

namespace LoPartidet.API.Services;

public class TournamentService(
    LoPartidetContext db,
    ITournamentValidationService validationService,
    ILogger<TournamentService> logger) : ITournamentService
{
    public async Task<TournamentDto> CreateAsync(CreateTournamentDto request)
    {
        var validation = await validationService.ValidateCreateTournamentAsync(request);
        if (!validation.IsValid)
            throw new InvalidOperationException(validation.Error);

        var tournament = new Tournament
        {
            Name = request.Name,
            SportType = request.SportType,
            Status = TournamentStatus.Draft,
            CreatedById = int.Parse(request.CreatedBy),
            StartDate = request.StartDate,
            GroupsCount = request.GroupsCount,
            TeamsPerGroup = request.TeamsPerGroup,
            QualifiedPerGroup = request.QualifiedPerGroup,
            IsSingleElimination = request.IsSingleElimination,
            HasThirdPlaceMatch = request.HasThirdPlaceMatch,
            HalfDurationMinutes = request.HalfDurationMinutes,
            HalfTimeDurationMinutes = request.HalfTimeDurationMinutes,
            GapBetweenMatchesMinutes = request.GapBetweenMatchesMinutes,
        };

        db.Tournaments.Add(tournament);
        await db.SaveChangesAsync();

        return new TournamentDto(
            tournament.Id,
            tournament.Name,
            tournament.SportType,
            tournament.Status,
            tournament.CreatedById,
            tournament.StartDate,
            tournament.GroupsCount,
            tournament.TeamsPerGroup,
            tournament.QualifiedPerGroup,
            tournament.IsSingleElimination,
            tournament.HasThirdPlaceMatch,
            tournament.HalfDurationMinutes,
            tournament.HalfTimeDurationMinutes,
            tournament.GapBetweenMatchesMinutes);
    }

    public async Task<TeamDto> AddTeamAsync(int tournamentId, CreateTeamDto request)
    {
        var validation = await validationService.ValidateAddTeamAsync(
            new AddTeamValidationRequest(tournamentId, request.Name, request.CreatedBy, request.MemberUserIds));
        if (!validation.IsValid)
            throw new InvalidOperationException(validation.Error);

        var team = new Team
        {
            Name = request.Name,
            TournamentId = tournamentId,
            CreatedById = int.Parse(request.CreatedBy),
        };

        db.Teams.Add(team);
        await db.SaveChangesAsync();

        var memberIds = request.MemberUserIds ?? [];
        if (memberIds.Count > 0)
        {
            foreach (var userId in memberIds)
                db.TeamMembers.Add(new TeamMember { TeamId = team.Id, UserId = userId });
            await db.SaveChangesAsync();
        }

        return new TeamDto(team.Id, team.Name, team.TournamentId, team.GroupId, team.CreatedById, memberIds);
    }

    public async Task<TournamentLocationDto> AddLocationAsync(int tournamentId, AddTournamentLocationDto request)
    {
        var validation = await validationService.ValidateAddLocationAsync(
            new AddTournamentLocationValidationRequest(tournamentId, request.LocationId));
        if (!validation.IsValid)
            throw new InvalidOperationException(validation.Error);

        var tournamentLocation = new TournamentLocation
        {
            TournamentId = tournamentId,
            LocationId = request.LocationId,
        };

        db.TournamentLocations.Add(tournamentLocation);
        await db.SaveChangesAsync();

        logger.LogInformation(
            "Location {LocationId} added to tournament {TournamentId}",
            request.LocationId, tournamentId);

        return new TournamentLocationDto(tournamentLocation.Id, tournamentLocation.TournamentId, tournamentLocation.LocationId);
    }

    public async Task StartTournamentAsync(int tournamentId)
    {
        var validation = await validationService.ValidateStartTournamentAsync(
            new StartTournamentValidationRequest(tournamentId));
        if (!validation.IsValid)
            throw new InvalidOperationException(validation.Error);

        await AssignTeamsToGroupsAsync(tournamentId);

        await CreateGroupStageMatches(tournamentId);

        await CreateTemplateBracketMatches(tournamentId);

        var tournament = await db.Tournaments.FirstAsync(t => t.Id == tournamentId);
        db.Entry(tournament).Property(t => t.Status).CurrentValue = TournamentStatus.GroupStage;
        await db.SaveChangesAsync();

        logger.LogInformation("Tournament {TournamentId} started", tournamentId);
    }

    public async Task<IReadOnlyList<GroupDto>> AssignTeamsToGroupsAsync(int tournamentId)
    {
        var validation = await validationService.ValidateAssignTeamsToGroupsAsync(
            new AssignTeamsToGroupsValidationRequest(tournamentId));
        if (!validation.IsValid)
            throw new InvalidOperationException(validation.Error);

        var tournament = await db.Tournaments.FirstAsync(t => t.Id == tournamentId);
        var teams = await db.Teams.Where(t => t.TournamentId == tournamentId).ToListAsync();

        var groups = Enumerable.Range(0, tournament.GroupsCount)
            .Select(i => new TournamentGroup
            {
                Name = $"1.{i + 1}",
                TournamentId = tournamentId,
                Phase = TournamentPhase.GroupStage,
            })
            .ToList();

        db.TournamentGroups.AddRange(groups);
        await db.SaveChangesAsync();

        var shuffled = teams.OrderBy(_ => Random.Shared.Next()).ToList();
        var assignments = new Dictionary<int, List<int>>();
        foreach (var group in groups)
            assignments[group.Id] = [];

        for (var i = 0; i < shuffled.Count; i++)
        {
            var group = groups[i % tournament.GroupsCount];
            var team = shuffled[i];
            db.Entry(team).Property(t => t.GroupId).CurrentValue = group.Id;
            assignments[group.Id].Add(team.Id);
        }
        await db.SaveChangesAsync();

        logger.LogInformation(
            "Tournament {TournamentId} assigned {TeamCount} teams across {GroupCount} groups",
            tournamentId, shuffled.Count, groups.Count);

        return groups
            .Select(g => (GroupDto)new GroupDto(g.Id, g.Name, g.TournamentId, assignments[g.Id]))
            .ToList();
    }

    internal async Task<List<TournamentMatch>> CreateGroupStageMatches(int tournamentId)
    {
        var tournament = await db.Tournaments.FirstAsync(t => t.Id == tournamentId);
        var groups = await db.TournamentGroups
            .Where(g => g.TournamentId == tournamentId)
            .ToListAsync();
        var teams = await db.Teams
            .Where(t => t.TournamentId == tournamentId)
            .ToListAsync();
        var tournamentLocationIds = await db.TournamentLocations
            .Where(tl => tl.TournamentId == tournamentId)
            .Select(tl => tl.Id)
            .ToListAsync();
        List<(int GroupId, int TeamAId, int TeamBId)> shuffledMatchups = GenerateTeamMatchups(groups, teams);

        var slotCadence = tournament.HalfDurationMinutes * 2 + tournament.HalfTimeDurationMinutes + tournament.GapBetweenMatchesMinutes;
        var createdAt = DateTime.Now;
        var matches = new List<TournamentMatch>(shuffledMatchups.Count);
        for (var k = 0; k < shuffledMatchups.Count; k++)
        {
            var (groupId, teamAId, teamBId) = shuffledMatchups[k];
            var locationIndex = k % tournamentLocationIds.Count;
            var slotIndex = k / tournamentLocationIds.Count;
            matches.Add(new TournamentMatch
            {
                TournamentId = tournamentId,
                GroupId = groupId,
                TeamAId = teamAId,
                TeamBId = teamBId,
                TournamentLocationId = tournamentLocationIds[locationIndex],
                Date = tournament.StartDate.AddMinutes(slotIndex * slotCadence),
                Status = MatchStatus.Scheduled,
                CreatedById = tournament.CreatedById,
                CreatedAt = createdAt,
                HalfDuration = tournament.HalfDurationMinutes,
                HalfTimeDuration = tournament.HalfTimeDurationMinutes,
            });
        }

        db.TournamentMatches.AddRange(matches);
        await db.SaveChangesAsync();

        logger.LogInformation(
            "Tournament {TournamentId} started with {MatchCount} matches across {LocationCount} locations",
            tournamentId, matches.Count, tournamentLocationIds.Count);
        return matches;
    }

    internal async Task<List<TournamentMatch>> CreateTemplateBracketMatches(int tournamentId)
    {
        var tournament = await db.Tournaments.FirstAsync(t => t.Id == tournamentId);
        var tournamentLocationIds = await db.TournamentLocations
            .Where(tl => tl.TournamentId == tournamentId)
            .Select(tl => tl.Id)
            .ToListAsync();

        var slotCadence = tournament.HalfDurationMinutes * 2 + tournament.HalfTimeDurationMinutes + tournament.GapBetweenMatchesMinutes;
        var bracketSize = tournament.GroupsCount * tournament.QualifiedPerGroup;
        if (bracketSize is not 2 and not 4 and not 8 and not 16) // F, SF, QF, R16
        {
            throw new InvalidOperationException($"Tournament {tournamentId} has invalid bracket size {bracketSize}. Must be 2, 4, 8, or 16.");
        }

        var rounds = BuildRoundList(bracketSize, tournament.HasThirdPlaceMatch);

        var latestGroupStageMatch = await db.TournamentMatches
            .Where(m => m.TournamentId == tournamentId && m.TournamentLocation.TournamentId == tournamentId)
            .OrderByDescending(m => m.Date)
            .FirstOrDefaultAsync();

        var bracketsStartDate = latestGroupStageMatch.Date.AddMinutes(slotCadence);

        var createdAt = DateTime.Now;
        var currentSlot = 0;
        var matches = new List<TournamentMatch>();
        foreach (var round in rounds)
        {
            var roundGroups = new List<TournamentGroup>(round.MatchCount);
            for (var slot = 1; slot <= round.MatchCount; slot++)
            {
                roundGroups.Add(new TournamentGroup
                {
                    Name = $"{Enum.GetName(round.Phase)}{slot}",
                    TournamentId = tournamentId,
                    Phase = round.Phase,
                    BracketSlot = slot,
                });
            }
            db.TournamentGroups.AddRange(roundGroups);
            await db.SaveChangesAsync();

            for (var k = 0; k < round.MatchCount; k++)
            {
                var locationIndex = k % tournamentLocationIds.Count;
                var subSlot = k / tournamentLocationIds.Count;
                var matchDate = bracketsStartDate.AddMinutes((currentSlot + subSlot) * slotCadence);
                matches.Add(new TournamentMatch
                {
                    TournamentId = tournamentId,
                    GroupId = roundGroups[k].Id,
                    TournamentLocationId = tournamentLocationIds[locationIndex],
                    Date = matchDate,
                    Status = MatchStatus.Scheduled,
                    CreatedById = tournament.CreatedById,
                    CreatedAt = createdAt,
                    HalfDuration = tournament.HalfDurationMinutes,
                    HalfTimeDuration = tournament.HalfTimeDurationMinutes,
                });
            }
            currentSlot += (int)Math.Ceiling((double)round.MatchCount / tournamentLocationIds.Count);
        }

        db.TournamentMatches.AddRange(matches);
        await db.SaveChangesAsync();

        logger.LogInformation(
            "Tournament {TournamentId} template bracket created: {MatchCount} matches across {RoundCount} rounds",
            tournamentId, matches.Count, rounds.Count);
        return matches;
    }

    private static List<(int GroupId, int TeamAId, int TeamBId)> GenerateTeamMatchups(List<TournamentGroup> groups, List<Team> teams)
    {
        var matchups = new List<(int GroupId, int TeamAId, int TeamBId)>();
        foreach (var group in groups)
        {
            var groupTeams = teams.Where(t => t.GroupId == group.Id).ToList();
            for (var i = 0; i < groupTeams.Count; i++)
                for (var j = i + 1; j < groupTeams.Count; j++)
                    matchups.Add((group.Id, groupTeams[i].Id, groupTeams[j].Id));
        }
        var shuffledMatchups = matchups.OrderBy(_ => Random.Shared.Next()).ToList();
        return shuffledMatchups;
    }

    private static List<RoundDefinition> BuildRoundList(int bracketSize, bool hasThirdPlaceMatch)
    {
        var rounds = new List<RoundDefinition>();
        if (bracketSize >= 16) rounds.Add(new RoundDefinition(TournamentPhase.RoundOf16, 8));
        if (bracketSize >= 8) rounds.Add(new RoundDefinition(TournamentPhase.QuarterFinal, 4));
        if (bracketSize >= 4) rounds.Add(new RoundDefinition(TournamentPhase.SemiFinal, 2));
        if (hasThirdPlaceMatch && bracketSize >= 4)
            rounds.Add(new RoundDefinition(TournamentPhase.ThirdPlace, 1));
        rounds.Add(new RoundDefinition(TournamentPhase.Final, 1));
        return rounds;
    }

    private sealed record RoundDefinition(TournamentPhase Phase, int MatchCount);

    public Task GetStandingsAsync(int tournamentId) => throw new NotImplementedException();

    public Task GetBracketAsync(int tournamentId) => throw new NotImplementedException();

    public Task GetByIdAsync(int id) => throw new NotImplementedException();

    public async Task<IReadOnlyList<TournamentDto>> GetAllAsync()
    {
        return await db.Tournaments
            .Select(t => new TournamentDto(
                t.Id,
                t.Name,
                t.SportType,
                t.Status,
                t.CreatedById,
                t.StartDate,
                t.GroupsCount,
                t.TeamsPerGroup,
                t.QualifiedPerGroup,
                t.IsSingleElimination,
                t.HasThirdPlaceMatch,
                t.HalfDurationMinutes,
                t.HalfTimeDurationMinutes,
                t.GapBetweenMatchesMinutes))
            .ToListAsync();
    }
}
