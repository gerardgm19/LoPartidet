using LoPartidet.API.Data;

namespace LoPartidet.API.Services.Validators;

public class UserValidationService(LoPartidetContext db) : IUserValidationService
{
    public Task<ValidationResult> ValidateUpdateUserAsync(UpdateUserValidationRequest request)
    {
        var userExists = db.Users.Any(u => u.Id == request.UserId);
        if (!userExists)
            return Task.FromResult(ValidationResult.Fail("User not found."));

        if (request.Name is not null && string.IsNullOrWhiteSpace(request.Name))
            return Task.FromResult(ValidationResult.Fail("Name cannot be empty."));

        if (request.Surname is not null && string.IsNullOrWhiteSpace(request.Surname))
            return Task.FromResult(ValidationResult.Fail("Surname cannot be empty."));

        if (request.Nickname is not null && string.IsNullOrWhiteSpace(request.Nickname))
            return Task.FromResult(ValidationResult.Fail("Nickname cannot be empty."));

        if (request.Email is not null && string.IsNullOrWhiteSpace(request.Email))
            return Task.FromResult(ValidationResult.Fail("Email cannot be empty."));

        return Task.FromResult(ValidationResult.Ok());
    }
}
