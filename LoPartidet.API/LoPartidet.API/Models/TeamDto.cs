namespace LoPartidet.API.Models;

public record TeamDto(
    int Id,
    string Name,
    int TournamentId,
    int? GroupId,
    int CreatedById,
    IReadOnlyList<int> MemberUserIds
);
