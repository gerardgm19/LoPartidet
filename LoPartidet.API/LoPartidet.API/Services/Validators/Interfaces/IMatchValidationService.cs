using LoPartidet.API.Models;

namespace LoPartidet.API.Services.Validators.Interfaces;

public interface IMatchValidationService
{
    Task<ValidationResult> ValidateCreateMatchAsync(CreateMatchDto request);
    Task<ValidationResult> ValidateUpdateMatchAsync(UpdateMatchValidationRequest request);
    Task<ValidationResult> ValidateJoinMatchAsync(JoinMatchValidationRequest request);
    Task<ValidationResult> ValidateUnjoinMatchAsync(UnjoinMatchValidationRequest request);
    Task<ValidationResult> ValidateDeleteMatchAsync(DeleteMatchValidationRequest request);
    Task<ValidationResult> ValidateCancelMatchAsync(CancelMatchValidationRequest request);
    Task<ValidationResult> ValidateCanEditMatchAsync(int matchId, string identityId, bool isAdmin);
}
