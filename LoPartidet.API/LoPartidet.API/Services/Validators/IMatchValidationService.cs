using LoPartidet.API.Models;

namespace LoPartidet.API.Services.Validators;

public interface IMatchValidationService
{
    Task<ValidationResult> ValidateCreateMatchAsync(CreateMatchDto request);
}
