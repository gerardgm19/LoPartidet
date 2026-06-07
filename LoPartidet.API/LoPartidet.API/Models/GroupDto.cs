namespace LoPartidet.API.Models;

public record GroupDto(
    int Id,
    string Name,
    int TournamentId,
    IReadOnlyList<int> TeamIds);
