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

        if (request.StartDate <= DateTime.UtcNow)
            return ValidationResult.Fail("Tournament start date must be in the future.");

        if (request.GroupsCount < 1)
            return ValidationResult.Fail("Groups count must be at least 1.");

        if (request.TeamsPerGroup < 2)
            return ValidationResult.Fail("Teams per group must be at least 2.");

        if (request.QualifiedPerGroup < 1)
            return ValidationResult.Fail("Qualified per group must be at least 1.");

        if (request.QualifiedPerGroup > request.TeamsPerGroup)
            return ValidationResult.Fail("Qualified per group cannot exceed teams per group.");

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

        if (request.MemberUserIds is { Count: > 0 } memberIds)
        {
            var distinctIds = memberIds.Distinct().ToList();
            var foundCount = await db.Users.CountAsync(u => distinctIds.Contains(u.Id));
            if (foundCount != distinctIds.Count)
                return ValidationResult.Fail("One or more team members do not exist.");
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
}
