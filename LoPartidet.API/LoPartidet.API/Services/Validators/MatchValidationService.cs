using LoPartidet.API.Data;
using LoPartidet.API.Models;

namespace LoPartidet.API.Services.Validators;

public class MatchValidationService(LoPartidetContext db) : IMatchValidationService
{
    public Task<ValidationResult> ValidateCreateMatchAsync(CreateMatchDto request)
    {
        var userExists = db.Users.Any(u => u.IdentityId == request.CreatedBy);
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
}
