using LoPartidet.API.Data;
using LoPartidet.API.Models;
using LoPartidet.API.Services.Validators.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LoPartidet.API.Services.Validators;

public class MatchValidationService(LoPartidetContext db) : IMatchValidationService
{
    public async Task<ValidationResult> ValidateCreateMatchAsync(CreateMatchDto request)
    {
        var userId = int.Parse(request.CreatedBy);
        var userExists = await db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            return ValidationResult.Fail("User not found.");

        if (request.Date <= DateTime.UtcNow)
            return ValidationResult.Fail("Match date must be in the future.");

        if (string.IsNullOrWhiteSpace(request.Location))
            return ValidationResult.Fail("Location is required.");

        if (request.MaxPlayers < 2)
            return ValidationResult.Fail("A match requires at least 2 players.");

        if (request.DurationInMinutes <= 0)
            return ValidationResult.Fail("Duration must be greater than 0.");

        return ValidationResult.Ok();
    }

    public async Task<ValidationResult> ValidateJoinMatchAsync(JoinMatchValidationRequest request)
    {
        if (!int.TryParse(request.UserId, out var userId))
            return ValidationResult.Fail("Invalid user ID.");

        var userExists = await db.Users.AnyAsync(u => u.Id == userId);
        if (!userExists)
            return ValidationResult.Fail("User not found.");

        var match = await db.Matches.FindAsync(request.MatchId);
        if (match is null)
            return ValidationResult.Fail("Match not found.");

        if (match.Status != MatchStatus.Scheduled)
            return ValidationResult.Fail("Can only join scheduled matches.");

        var alreadyJoined = await db.UserMatches.AnyAsync(um => um.MatchId == request.MatchId && um.UserId == userId);
        if (alreadyJoined)
            return ValidationResult.Fail("User already joined this match.");

        var currentPlayers = await db.UserMatches.CountAsync(um => um.MatchId == request.MatchId);
        if (currentPlayers >= match.MaxPlayers)
            return ValidationResult.Fail("Match is full.");

        return ValidationResult.Ok();
    }

    public async Task<ValidationResult> ValidateUnjoinMatchAsync(UnjoinMatchValidationRequest request)
    {
        if (!int.TryParse(request.UserId, out var userId))
            return ValidationResult.Fail("Invalid user ID.");

        var match = await db.Matches.FindAsync(request.MatchId);
        if (match is null)
            return ValidationResult.Fail("Match not found.");

        if (match.Status != MatchStatus.Scheduled)
            return ValidationResult.Fail("Can only unjoin scheduled matches.");

        var joined = await db.UserMatches.AnyAsync(um => um.MatchId == request.MatchId && um.UserId == userId);
        if (!joined)
            return ValidationResult.Fail("User is not joined to this match.");

        return ValidationResult.Ok();
    }
}
