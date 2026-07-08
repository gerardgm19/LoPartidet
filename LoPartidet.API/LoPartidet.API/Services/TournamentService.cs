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

    public async Task<TournamentDto> UpdateAsync(int id, UpdateTournamentDto request)
    {
        var validation = await validationService.ValidateUpdateTournamentAsync(id, request);
        if (!validation.IsValid)
            throw new InvalidOperationException(validation.Error);

        var tournament = await db.Tournaments.FirstOrDefaultAsync(t => t.Id == id)
            ?? throw new InvalidOperationException($"Tournament {id} not found.");

        // Tournament properties use init accessors; update through the change tracker.
        var entry = db.Entry(tournament);
        entry.Property(t => t.Name).CurrentValue = request.Name;
        entry.Property(t => t.SportType).CurrentValue = request.SportType;
        entry.Property(t => t.StartDate).CurrentValue = request.StartDate;
        entry.Property(t => t.GroupsCount).CurrentValue = request.GroupsCount;
        entry.Property(t => t.TeamsPerGroup).CurrentValue = request.TeamsPerGroup;
        entry.Property(t => t.QualifiedPerGroup).CurrentValue = request.QualifiedPerGroup;
        entry.Property(t => t.IsSingleElimination).CurrentValue = request.IsSingleElimination;
        entry.Property(t => t.HasThirdPlaceMatch).CurrentValue = request.HasThirdPlaceMatch;
        entry.Property(t => t.HalfDurationMinutes).CurrentValue = request.HalfDurationMinutes;
        entry.Property(t => t.HalfTimeDurationMinutes).CurrentValue = request.HalfTimeDurationMinutes;
        entry.Property(t => t.GapBetweenMatchesMinutes).CurrentValue = request.GapBetweenMatchesMinutes;

        await ReconcileLocationsAsync(id, request.LocationIds);

        await db.SaveChangesAsync();

        logger.LogInformation("Tournament {TournamentId} updated", id);

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

    private async Task ReconcileLocationsAsync(int tournamentId, IReadOnlyList<int> locationIds)
    {
        var requestedIds = locationIds.Distinct().ToList();

        var currentLinks = await db.TournamentLocations
            .Where(tl => tl.TournamentId == tournamentId)
            .ToListAsync();
        var currentIds = currentLinks.Select(tl => tl.LocationId).ToList();

        var toRemove = currentLinks.Where(tl => !requestedIds.Contains(tl.LocationId)).ToList();
        if (toRemove.Count > 0)
            db.TournamentLocations.RemoveRange(toRemove);

        foreach (var locationId in requestedIds.Where(rid => !currentIds.Contains(rid)))
            db.TournamentLocations.Add(new TournamentLocation { TournamentId = tournamentId, LocationId = locationId });

        logger.LogInformation(
            "Tournament {TournamentId} locations reconciled: {Added} added, {Removed} removed",
            tournamentId, requestedIds.Count(rid => !currentIds.Contains(rid)), toRemove.Count);
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

        return new TeamDto(team.Id, team.Name, team.TournamentId, team.GroupId, team.CreatedById, false);
    }

    #region Test methods

    public async Task<IReadOnlyList<TeamDto>> GenerateTestTeams(int tournamentId)
    {
        var tournament = await db.Tournaments.FirstOrDefaultAsync(t => t.Id == tournamentId);
        if (tournament is null)
            throw new InvalidOperationException($"Tournament {tournamentId} not found.");

        var capacity = tournament.GroupsCount * tournament.TeamsPerGroup;
        var existingCount = await db.Teams.CountAsync(t => t.TournamentId == tournamentId);
        var missing = capacity - existingCount;
        if (missing <= 0)
        {
            logger.LogInformation(
                "Tournament {TournamentId} already full ({ExistingCount}/{Capacity} teams), no test teams generated",
                tournamentId, existingCount, capacity);
            return [];
        }

        var teams = new List<Team>(missing);
        for (var i = 0; i < missing; i++)
        {
            teams.Add(new Team
            {
                Name = $"Test Team {existingCount + i + 1}",
                TournamentId = tournamentId,
                CreatedById = tournament.CreatedById,
            });
        }

        db.Teams.AddRange(teams);
        await db.SaveChangesAsync();

        logger.LogInformation(
            "Tournament {TournamentId} generated {Count} test teams to reach capacity {Capacity}",
            tournamentId, teams.Count, capacity);

        return teams
            .Select(t => new TeamDto(t.Id, t.Name, t.TournamentId, t.GroupId, t.CreatedById, false))
            .ToList();
    }

    public async Task<TournamentPreviewDto> GetTestTournamentGroupsAndMatchesAsync(int tournamentId)
    {
        var validation = await validationService.ValidateStartTournamentAsync(
            new StartTournamentValidationRequest(tournamentId));
        if (!validation.IsValid)
            throw new InvalidOperationException(validation.Error);

        var tournament = await db.Tournaments.FirstAsync(t => t.Id == tournamentId);
        var teams = await db.Teams
            .Where(t => t.TournamentId == tournamentId)
            .ToListAsync();
        var tournamentLocationIds = await db.TournamentLocations
            .Where(tl => tl.TournamentId == tournamentId)
            .Select(tl => tl.Id)
            .ToListAsync();

        var slotCadence = tournament.HalfDurationMinutes * 2 + tournament.HalfTimeDurationMinutes + tournament.GapBetweenMatchesMinutes;

        // Assign teams to groups in memory (mirrors AssignTeamsToGroupsAsync, without persisting).
        var groups = Enumerable.Range(0, tournament.GroupsCount)
            .Select(i => (Name: $"1.{i + 1}", Teams: new List<Team>()))
            .ToList();
        var shuffledTeams = teams.OrderBy(_ => Random.Shared.Next()).ToList();
        for (var i = 0; i < shuffledTeams.Count; i++)
            groups[i % tournament.GroupsCount].Teams.Add(shuffledTeams[i]);

        // Group stage matchups (mirrors CreateGroupStageMatches).
        var matchups = new List<(string GroupName, Team A, Team B)>();
        foreach (var group in groups)
            for (var i = 0; i < group.Teams.Count; i++)
                for (var j = i + 1; j < group.Teams.Count; j++)
                    matchups.Add((group.Name, group.Teams[i], group.Teams[j]));
        var shuffledMatchups = matchups.OrderBy(_ => Random.Shared.Next()).ToList();

        var groupStageMatches = new List<PreviewMatchDto>(shuffledMatchups.Count);
        for (var k = 0; k < shuffledMatchups.Count; k++)
        {
            var (groupName, teamA, teamB) = shuffledMatchups[k];
            var locationIndex = k % tournamentLocationIds.Count;
            var slotIndex = k / tournamentLocationIds.Count;
            groupStageMatches.Add(new PreviewMatchDto(
                groupName,
                TournamentPhase.GroupStage,
                null,
                teamA.Id, teamA.Name, null,
                teamB.Id, teamB.Name, null,
                tournamentLocationIds[locationIndex],
                tournament.StartDate.AddMinutes(slotIndex * slotCadence)));
        }

        // Bracket template (mirrors CreateTemplateBracketMatches) — no teams assigned yet.
        var bracketSize = tournament.GroupsCount * tournament.QualifiedPerGroup;
        var rounds = BuildRoundList(bracketSize, tournament.HasThirdPlaceMatch);
        var latestGroupStageDate = groupStageMatches.Count > 0
            ? groupStageMatches.Max(m => m.Date)
            : tournament.StartDate;
        var bracketsStartDate = latestGroupStageDate.AddMinutes(slotCadence);

        var currentSlot = 0;
        var bracketMatches = new List<PreviewMatchDto>();
        foreach (var round in rounds)
        {
            for (var k = 0; k < round.MatchCount; k++)
            {
                var locationIndex = k % tournamentLocationIds.Count;
                var subSlot = k / tournamentLocationIds.Count;
                bracketMatches.Add(new PreviewMatchDto(
                    $"{Enum.GetName(round.Phase)}{k + 1}",
                    round.Phase,
                    k + 1,
                    null, null, null,
                    null, null, null,
                    tournamentLocationIds[locationIndex],
                    bracketsStartDate.AddMinutes((currentSlot + subSlot) * slotCadence)));
            }
            currentSlot += (int)Math.Ceiling((double)round.MatchCount / tournamentLocationIds.Count);
        }

        var groupDtos = groups
            .Select(g => new PreviewGroupDto(
                g.Name,
                TournamentPhase.GroupStage,
                g.Teams.Select(team => new PreviewTeamDto(team.Id, team.Name)).ToList()))
            .ToList();

        return new TournamentPreviewDto(groupDtos, groupStageMatches, bracketMatches);
    }

    #endregion

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

    public async Task<TournamentDataDto> GenerateTournamentData(int tournamentId)
    {
        var validation = await validationService.ValidateStartTournamentAsync(
            new StartTournamentValidationRequest(tournamentId));
        if (!validation.IsValid)
            throw new InvalidOperationException(validation.Error);

        await AssignTeamsToGroupsAsync(tournamentId);

        await CreateGroupStageMatches(tournamentId);

        await CreateTemplateBracketMatches(tournamentId);

        logger.LogInformation("Tournament {TournamentId} data generated", tournamentId);

        return await GetResultsAsync(tournamentId);
    }

    public async Task DeleteTournamentDataAsync(int tournamentId)
    {
        var tournament = await db.Tournaments.FirstOrDefaultAsync(t => t.Id == tournamentId)
            ?? throw new InvalidOperationException($"Tournament {tournamentId} not found.");

        if (tournament.Status != TournamentStatus.Draft)
            throw new InvalidOperationException($"Tournament {tournamentId} data can only be deleted while in Draft.");

        var matches = await db.TournamentMatches
            .Where(m => m.TournamentId == tournamentId)
            .ToListAsync();
        db.TournamentMatches.RemoveRange(matches);

        // Unassign teams from the groups about to be removed (Team.GroupId FK → TournamentGroup).
        var teams = await db.Teams
            .Where(t => t.TournamentId == tournamentId && t.GroupId != null)
            .ToListAsync();
        foreach (var team in teams)
            db.Entry(team).Property(t => t.GroupId).CurrentValue = null;

        var groups = await db.TournamentGroups
            .Where(g => g.TournamentId == tournamentId)
            .ToListAsync();
        db.TournamentGroups.RemoveRange(groups);

        await db.SaveChangesAsync();

        logger.LogInformation(
            "Tournament {TournamentId} generated data deleted: {MatchCount} matches, {GroupCount} groups",
            tournamentId, matches.Count, groups.Count);
    }

    public async Task<TournamentDataDto> GetResultsAsync(int tournamentId)
    {
        var groups = await db.TournamentGroups
            .Where(g => g.TournamentId == tournamentId && g.Phase == TournamentPhase.GroupStage)
            .OrderBy(g => g.Name)
            .Select(g => new TournamentGroupDto(
                g.Id,
                g.Name,
                g.Phase,
                db.Teams
                    .Where(t => t.GroupId == g.Id)
                    .Select(t => new PreviewTeamDto(t.Id, t.Name))
                    .ToList()))
            .ToListAsync();

        var matches = await db.TournamentMatches
            .Where(m => m.TournamentId == tournamentId)
            .OrderBy(m => m.Date)
            .Select(m => new TournamentMatchDto(
                m.Id,
                m.GroupId!.Value,
                m.Group!.Name,
                m.Group.Phase,
                m.Group.BracketSlot,
                m.TeamAId,
                m.TeamA != null ? m.TeamA.Name : null,
                null,
                m.TeamBId,
                m.TeamB != null ? m.TeamB.Name : null,
                null,
                m.TournamentLocationId,
                m.Date))
            .ToListAsync();

        var groupStageMatches = matches.Where(m => m.Phase == TournamentPhase.GroupStage).ToList();
        var bracketMatches = matches.Where(m => m.Phase != TournamentPhase.GroupStage).ToList();

        return new TournamentDataDto(groups, groupStageMatches, bracketMatches);
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

    public async Task<IReadOnlyList<TeamDto>> GetTeamsByTournamentAsync(int tournamentId, string identityId)
    {
        var appUserId = await db.Users
            .Where(u => u.IdentityId == identityId)
            .Select(u => u.Id)
            .FirstOrDefaultAsync();

        return await db.Teams
            .Where(t => t.TournamentId == tournamentId)
            .Select(t => new TeamDto(
                t.Id,
                t.Name,
                t.TournamentId,
                t.GroupId,
                t.CreatedById,
                appUserId > 0 && t.Members.Any(m => m.UserId == appUserId)))
            .ToListAsync();
    }

    public Task GetStandingsAsync(int tournamentId) => throw new NotImplementedException();

    public Task GetBracketAsync(int tournamentId) => throw new NotImplementedException();

    public async Task<TournamentDetailDto?> GetByIdAsync(int id, string identityId)
    {
        var t = await db.Tournaments.FindAsync(id);
        if (t is null) return null;

        var appUserId = await db.Users
            .Where(u => u.IdentityId == identityId)
            .Select(u => u.Id)
            .FirstOrDefaultAsync();

        var isCurrentUserInTeam = await db.Teams
            .Where(tm => tm.TournamentId == id)
            .AnyAsync(tm => tm.CreatedById == appUserId ||
                tm.Members.Any(m => m.UserId == appUserId));

        var locations = await db.TournamentLocations
            .Where(tl => tl.TournamentId == id)
            .OrderBy(tl => tl.Location.Name)
            .Select(tl => new LocationDto(tl.LocationId, tl.Location.Name))
            .ToListAsync();

        return new TournamentDetailDto(
            t.Id, t.Name, t.SportType, t.Status, t.CreatedById, t.StartDate,
            t.GroupsCount, t.TeamsPerGroup, t.QualifiedPerGroup,
            t.IsSingleElimination, t.HasThirdPlaceMatch,
            t.HalfDurationMinutes, t.HalfTimeDurationMinutes, t.GapBetweenMatchesMinutes,
            isCurrentUserInTeam, locations);
    }

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
