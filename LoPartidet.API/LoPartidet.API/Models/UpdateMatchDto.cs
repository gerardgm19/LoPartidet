using LoPartidet.API.Models.Enums;

namespace LoPartidet.API.Models;

public record UpdateMatchDto(
    SportType Type,
    DateTime Date,
    string Location,
    int MaxPlayers,
    int DurationInMinutes
);
