namespace LoPartidet.API.Models;

public record CreateTeamDto(
    string Name,
    string CreatedBy,
    IReadOnlyList<int>? MemberUserIds
);
