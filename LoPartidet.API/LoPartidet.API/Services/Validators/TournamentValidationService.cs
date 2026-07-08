using LoPartidet.API.Data;
using LoPartidet.API.Models;
using LoPartidet.API.Models.Enums;
using LoPartidet.API.Services.Validators.Interfaces;
using LoPartidet.API.Services.Validators.Models;
using Microsoft.EntityFrameworkCore;

namespace LoPartidet.API.Services.Validators;

public class TournamentValidationService(LoPartidetContext db) : ITournamentValidationService
{
    public async Task<ValidationResult> ValidateCreateTournamentAsync(CreateTournamentDto request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ValidationResult.Fail("Name is required.");

        if (!int.TryParse(request.CreatedBy, out var userId))
            return ValidationResult.Fail("Invalid user ID.");

        var userExists = await db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            return ValidationResult.Fail("User not found.");

        if (request.StartDate <= DateTime.Now)
            return ValidationResult.Fail("Tournament start date must be in the future.");

        if (request.GroupsCount < 1)
            return ValidationResult.Fail("Groups count must be at least 1.");

        if (request.TeamsPerGroup < 2)
            return ValidationResult.Fail("Teams per group must be at least 2.");

        if (request.QualifiedPerGroup < 1)
            return ValidationResult.Fail("Qualified per group must be at least 1.");

        if (request.QualifiedPerGroup > request.TeamsPerGroup)
            return ValidationResult.Fail("Qualified per group cannot exceed teams per group.");

        if (request.HalfDurationMinutes < 1)
            return ValidationResult.Fail("Half duration must be at least 1 minute.");

        if (request.HalfTimeDurationMinutes < 0)
            return ValidationResult.Fail("Half-time duration cannot be negative.");

        if (request.GapBetweenMatchesMinutes < 0)
            return ValidationResult.Fail("Gap between matches cannot be negative.");

        return ValidationResult.Ok();
    }

    public async Task<ValidationResult> ValidateUpdateTournamentAsync(int tournamentId, UpdateTournamentDto request)
    {
        var tournament = await db.Tournaments.FindAsync(tournamentId);
        if (tournament is null)
            return ValidationResult.Fail("Tournament not found.");

        if (tournament.Status != TournamentStatus.Draft)
            return ValidationResult.Fail("Only Draft tournaments can be edited.");

        if (string.IsNullOrWhiteSpace(request.Name))
            return ValidationResult.Fail("Name is required.");

        if (request.StartDate <= DateTime.Now)
            return ValidationResult.Fail("Tournament start date must be in the future.");

        if (request.GroupsCount < 1)
            return ValidationResult.Fail("Groups count must be at least 1.");

        if (request.TeamsPerGroup < 2)
            return ValidationResult.Fail("Teams per group must be at least 2.");

        if (request.QualifiedPerGroup < 1)
            return ValidationResult.Fail("Qualified per group must be at least 1.");

        if (request.QualifiedPerGroup > request.TeamsPerGroup)
            return ValidationResult.Fail("Qualified per group cannot exceed teams per group.");

        if (request.HalfDurationMinutes < 1)
            return ValidationResult.Fail("Half duration must be at least 1 minute.");

        if (request.HalfTimeDurationMinutes < 0)
            return ValidationResult.Fail("Half-time duration cannot be negative.");

        if (request.GapBetweenMatchesMinutes < 0)
            return ValidationResult.Fail("Gap between matches cannot be negative.");

        var teamCount = await db.Teams.CountAsync(t => t.TournamentId == tournamentId);
        var capacity = request.GroupsCount * request.TeamsPerGroup;
        if (teamCount > capacity)
            return ValidationResult.Fail("New capacity is smaller than the number of teams already registered.");

        var locationIds = request.LocationIds?.Distinct().ToList() ?? [];
        if (locationIds.Count > 0)
        {
            var foundCount = await db.Locations.CountAsync(l => locationIds.Contains(l.Id));
            if (foundCount != locationIds.Count)
                return ValidationResult.Fail("One or more locations do not exist.");
        }

        return ValidationResult.Ok();
    }

    public async Task<ValidationResult> ValidateAddTeamAsync(AddTeamValidationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ValidationResult.Fail("Name is required.");

        if (!int.TryParse(request.CreatedBy, out var userId))
            return ValidationResult.Fail("Invalid user ID.");

        var userExists = await db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            return ValidationResult.Fail("User not found.");

        var tournament = await db.Tournaments.FindAsync(request.TournamentId);
        if (tournament is null)
            return ValidationResult.Fail("Tournament not found.");

        if (tournament.Status != TournamentStatus.Draft)
            return ValidationResult.Fail("Teams can only be added while tournament is in Draft.");

        var teamCount = await db.Teams.CountAsync(t => t.TournamentId == request.TournamentId);
        var capacity = tournament.GroupsCount * tournament.TeamsPerGroup;
        if (teamCount >= capacity)
            return ValidationResult.Fail("Tournament is full.");

        var nameTaken = await db.Teams.AnyAsync(t => t.TournamentId == request.TournamentId && t.Name == request.Name);
        if (nameTaken)
            return ValidationResult.Fail("Team name already used in this tournament.");

        var allCandidateIds = new List<int> { userId };
        if (request.MemberUserIds is { Count: > 0 } memberIds)
        {
            var distinctIds = memberIds.Distinct().ToList();
            var foundCount = await db.Users.CountAsync(u => distinctIds.Contains(u.Id));
            if (foundCount != distinctIds.Count)
                return ValidationResult.Fail("One or more team members do not exist.");
            allCandidateIds.AddRange(distinctIds);
        }

        var tournamentTeamIds = await db.Teams
            .Where(t => t.TournamentId == request.TournamentId)
            .Select(t => t.Id)
            .ToListAsync();

        if (tournamentTeamIds.Count > 0)
        {
            var alreadyInTeam = await db.TeamMembers
                .AnyAsync(m => tournamentTeamIds.Contains(m.TeamId) && allCandidateIds.Contains(m.UserId));
            if (alreadyInTeam)
                return ValidationResult.Fail("One or more players are already in a team in this tournament.");

            var creatorAlreadyLeads = await db.Teams
                .AnyAsync(t => t.TournamentId == request.TournamentId && t.CreatedById == userId);
            if (creatorAlreadyLeads)
                return ValidationResult.Fail("You already have a team in this tournament.");
        }

        return ValidationResult.Ok();
    }

    public async Task<ValidationResult> ValidateAssignTeamsToGroupsAsync(AssignTeamsToGroupsValidationRequest request)
    {
        var tournament = await db.Tournaments.FindAsync(request.TournamentId);
        if (tournament is null)
            return ValidationResult.Fail("Tournament not found.");

        if (tournament.Status != TournamentStatus.Draft)
            return ValidationResult.Fail("Teams can only be assigned to groups while tournament is in Draft.");

        var alreadyAssigned = await db.TournamentGroups
            .AnyAsync(g => g.TournamentId == request.TournamentId && g.Phase == TournamentPhase.GroupStage);
        if (alreadyAssigned)
            return ValidationResult.Fail("Groups have already been assigned for this tournament.");

        var teamCount = await db.Teams.CountAsync(t => t.TournamentId == request.TournamentId);
        var capacity = tournament.GroupsCount * tournament.TeamsPerGroup;
        if (teamCount != capacity)
            return ValidationResult.Fail("Tournament team count does not match expected capacity.");

        return ValidationResult.Ok();
    }

    public async Task<ValidationResult> ValidateStartTournamentAsync(StartTournamentValidationRequest request)
    {
        var tournament = await db.Tournaments.FindAsync(request.TournamentId);
        if (tournament is null)
            return ValidationResult.Fail("Tournament not found.");

        if (tournament.Status != TournamentStatus.Draft)
            return ValidationResult.Fail("Only Draft tournaments can be started.");

        var locationCount = await db.TournamentLocations.CountAsync(tl => tl.TournamentId == request.TournamentId);
        if (locationCount < 1)
            return ValidationResult.Fail("Tournament must have at least one location assigned.");

        var teamCount = await db.Teams.CountAsync(t => t.TournamentId == request.TournamentId);
        var capacity = tournament.GroupsCount * tournament.TeamsPerGroup;
        if (teamCount != capacity)
            return ValidationResult.Fail("Tournament team count does not match expected capacity.");

        var bracketSize = tournament.GroupsCount * tournament.QualifiedPerGroup;
        if (bracketSize is not (2 or 4 or 8 or 16))
            return ValidationResult.Fail("Groups count multiplied by qualified per group must equal 2, 4, 8, or 16.");

        return ValidationResult.Ok();
    }

    public async Task<ValidationResult> ValidateAddLocationAsync(AddTournamentLocationValidationRequest request)
    {
        var tournamentExists = await db.Tournaments.AnyAsync(t => t.Id == request.TournamentId);
        if (!tournamentExists)
            return ValidationResult.Fail("Tournament not found.");

        var locationExists = await db.Locations.AnyAsync(l => l.Id == request.LocationId);
        if (!locationExists)
            return ValidationResult.Fail("Location not found.");

        var duplicate = await db.TournamentLocations
            .AnyAsync(tl => tl.TournamentId == request.TournamentId && tl.LocationId == request.LocationId);
        if (duplicate)
            return ValidationResult.Fail("Location already assigned to this tournament.");

        return ValidationResult.Ok();
    }
}
