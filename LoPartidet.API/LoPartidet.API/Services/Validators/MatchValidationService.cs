using LoPartidet.API.Data;
using LoPartidet.API.Models;

namespace LoPartidet.API.Services.Validators;

public class MatchValidationService(LoPartidetContext db) : IMatchValidationService
{
    public Task<ValidationResult> ValidateCreateMatchAsync(CreateMatchDto request)
    {
        var userId = int.Parse(request.CreatedBy);
        var userExists = db.Users.Any(u => u.Id == userId);
        if (!userExists)
            return Task.FromResult(ValidationResult.Fail("User not found."));

        if (request.Date <= DateTime.UtcNow)
            return Task.FromResult(ValidationResult.Fail("Match date must be in the future."));

        if (string.IsNullOrWhiteSpace(request.Location))
            return Task.FromResult(ValidationResult.Fail("Location is required."));

        if (request.MaxPlayers < 2)
            return Task.FromResult(ValidationResult.Fail("A match requires at least 2 players."));

        return Task.FromResult(ValidationResult.Ok());
    }

    public Task<ValidationResult> ValidateJoinMatchAsync(JoinMatchValidationRequest request)
    {
        if (!int.TryParse(request.UserId, out var userId))
            return Task.FromResult(ValidationResult.Fail("Invalid user ID."));

        var userExists = db.Users.Any(u => u.Id == userId);
        if (!userExists)
            return Task.FromResult(ValidationResult.Fail("User not found."));

        var match = db.Matches.Find(request.MatchId);
        if (match is null)
            return Task.FromResult(ValidationResult.Fail("Match not found."));

        if (match.Status != MatchStatus.Scheduled)
            return Task.FromResult(ValidationResult.Fail("Can only join scheduled matches."));

        var alreadyJoined = db.UserMatches.Any(um => um.MatchId == request.MatchId && um.UserId == userId);
        if (alreadyJoined)
            return Task.FromResult(ValidationResult.Fail("User already joined this match."));

        var currentPlayers = db.UserMatches.Count(um => um.MatchId == request.MatchId);
        if (currentPlayers >= match.MaxPlayers)
            return Task.FromResult(ValidationResult.Fail("Match is full."));

        return Task.FromResult(ValidationResult.Ok());
    }

    public Task<ValidationResult> ValidateUnjoinMatchAsync(UnjoinMatchValidationRequest request)
    {
        if (!int.TryParse(request.UserId, out var userId))
            return Task.FromResult(ValidationResult.Fail("Invalid user ID."));

        var match = db.Matches.Find(request.MatchId);
        if (match is null)
            return Task.FromResult(ValidationResult.Fail("Match not found."));

        if (match.Status != MatchStatus.Scheduled)
            return Task.FromResult(ValidationResult.Fail("Can only unjoin scheduled matches."));

        var joined = db.UserMatches.Any(um => um.MatchId == request.MatchId && um.UserId == userId);
        if (!joined)
            return Task.FromResult(ValidationResult.Fail("User is not joined to this match."));

        return Task.FromResult(ValidationResult.Ok());
    }
}
