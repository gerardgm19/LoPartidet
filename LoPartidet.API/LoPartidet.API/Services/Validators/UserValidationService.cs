using LoPartidet.API.Data;
using Microsoft.EntityFrameworkCore;

namespace LoPartidet.API.Services.Validators;

public class UserValidationService(LoPartidetContext db) : IUserValidationService
{
    public async Task<ValidationResult> ValidateUpdateUserAsync(UpdateUserValidationRequest request)
    {
        var userExists = await db.Users.AnyAsync(u => u.Id == request.UserId);
        if (!userExists)
            return ValidationResult.Fail("User not found.");

        if (request.Name is not null && string.IsNullOrWhiteSpace(request.Name))
            return ValidationResult.Fail("Name cannot be empty.");

        if (request.Surname is not null && string.IsNullOrWhiteSpace(request.Surname))
            return ValidationResult.Fail("Surname cannot be empty.");

        if (request.Nickname is not null && string.IsNullOrWhiteSpace(request.Nickname))
            return ValidationResult.Fail("Nickname cannot be empty.");

        if (request.Email is not null && string.IsNullOrWhiteSpace(request.Email))
            return ValidationResult.Fail("Email cannot be empty.");

        return ValidationResult.Ok();
    }
}
