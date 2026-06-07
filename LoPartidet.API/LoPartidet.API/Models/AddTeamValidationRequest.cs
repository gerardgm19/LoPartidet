namespace LoPartidet.API.Models;

public record AddTeamValidationRequest(
    int TournamentId,
    string Name,
    string CreatedBy,
    IReadOnlyList<int>? MemberUserIds
);
