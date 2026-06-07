using LoPartidet.API.Models;

namespace LoPartidet.API.Services.Validators;

public interface ITournamentValidationService
{
    Task<ValidationResult> ValidateCreateTournamentAsync(CreateTournamentDto request);
    Task<ValidationResult> ValidateAddTeamAsync(AddTeamValidationRequest request);
}
