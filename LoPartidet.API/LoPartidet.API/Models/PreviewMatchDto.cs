using LoPartidet.API.Models.Enums;

namespace LoPartidet.API.Models;

public record PreviewMatchDto(
    string GroupName,
    TournamentPhase Phase,
    int? BracketSlot,
    int? TeamAId,
    string? TeamAName,
    int? TeamBId,
    string? TeamBName,
    int TournamentLocationId,
    DateTime Date);
