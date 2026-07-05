using LoPartidet.API.Models.Enums;

namespace LoPartidet.API.Models;

public record PreviewGroupDto(
    string Name,
    TournamentPhase Phase,
    IReadOnlyList<PreviewTeamDto> Teams);
