using LoPartidet.API.Models.Enums;

namespace LoPartidet.API.Models;

public record PreviewMatchDto(
    string GroupName,
    TournamentPhase Phase,
    int? BracketSlot,
    int? TeamAId,
    string? TeamAName,
    int? TeamAScore,
    int? TeamBId,
    string? TeamBName,
    int? TeamBScore,
    int TournamentLocationId,
    DateTime Date);
