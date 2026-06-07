using LoPartidet.API.Models;

namespace LoPartidet.API.Services.Validators.Interfaces;

public interface IMatchValidationService
{
    Task<ValidationResult> ValidateCreateMatchAsync(CreateMatchDto request);
    Task<ValidationResult> ValidateJoinMatchAsync(JoinMatchValidationRequest request);
    Task<ValidationResult> ValidateUnjoinMatchAsync(UnjoinMatchValidationRequest request);
}
