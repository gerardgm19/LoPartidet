namespace LoPartidet.API.Models;

public record TournamentDataDto(
    IReadOnlyList<TournamentGroupDto> Groups,
    IReadOnlyList<TournamentMatchDto> GroupStageMatches,
    IReadOnlyList<TournamentMatchDto> BracketMatches);
