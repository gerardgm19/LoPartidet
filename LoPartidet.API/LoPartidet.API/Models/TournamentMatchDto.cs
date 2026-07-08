using LoPartidet.API.Models.Enums;

namespace LoPartidet.API.Models;

public record TournamentMatchDto(
    int Id,
    int GroupId,
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
