namespace LoPartidet.API.Models;

public record MatchDto(
    int Id,
    int CreatedById,
    DateTime CreatedAt,
    SportType Type,
    DateTime Date,
    string Location,
    int MaxPlayers,
    MatchStatus Status
);
