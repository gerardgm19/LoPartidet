using LoPartidet.API.Models;
using LoPartidet.API.Services.Validators.Models;

namespace LoPartidet.API.Services.Validators.Interfaces;

public interface ITournamentValidationService
{
    Task<ValidationResult> ValidateCreateTournamentAsync(CreateTournamentDto request);
    Task<ValidationResult> ValidateAddTeamAsync(AddTeamValidationRequest request);
    Task<ValidationResult> ValidateAssignTeamsToGroupsAsync(AssignTeamsToGroupsValidationRequest request);
}
