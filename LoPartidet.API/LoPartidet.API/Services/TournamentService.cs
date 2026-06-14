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
            tournament.QualifiedPerGroup);
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

    public Task StartTournamentAsync(int tournamentId) => throw new NotImplementedException();

    public Task GetStandingsAsync(int tournamentId) => throw new NotImplementedException();

    public Task GetBracketAsync(int tournamentId) => throw new NotImplementedException();

    public Task GetByIdAsync(int id) => throw new NotImplementedException();

    public Task GetAllAsync() => throw new NotImplementedException();
}
