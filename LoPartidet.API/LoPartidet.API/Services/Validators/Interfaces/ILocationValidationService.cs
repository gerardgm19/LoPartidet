using LoPartidet.API.Services.Validators.Models;

namespace LoPartidet.API.Services.Validators.Interfaces;

public interface ILocationValidationService
{
    Task<ValidationResult> ValidateCreateLocationAsync(CreateLocationValidationRequest request);
    Task<ValidationResult> ValidateUpdateLocationAsync(UpdateLocationValidationRequest request);
    Task<ValidationResult> ValidateDeleteLocationAsync(DeleteLocationValidationRequest request);
}
