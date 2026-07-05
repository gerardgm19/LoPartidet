namespace LoPartidet.API.Models;

public record TournamentPreviewDto(
    IReadOnlyList<PreviewGroupDto> Groups,
    IReadOnlyList<PreviewMatchDto> GroupStageMatches,
    IReadOnlyList<PreviewMatchDto> BracketMatches);
