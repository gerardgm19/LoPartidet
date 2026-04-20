namespace LoPartidet.API.Services.Validators;

public interface IUserValidationService
{
    Task<ValidationResult> ValidateUpdateUserAsync(UpdateUserValidationRequest request);
}
