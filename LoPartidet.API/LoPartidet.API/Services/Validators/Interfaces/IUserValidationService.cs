namespace LoPartidet.API.Services.Validators.Interfaces;

public interface IUserValidationService
{
    Task<ValidationResult> ValidateUpdateUserAsync(UpdateUserValidationRequest request);
}
