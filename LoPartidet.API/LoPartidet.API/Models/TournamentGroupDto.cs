using LoPartidet.API.Models.Enums;

namespace LoPartidet.API.Models;

public record TournamentGroupDto(
    int Id,
    string Name,
    TournamentPhase Phase,
    IReadOnlyList<PreviewTeamDto> Teams);
