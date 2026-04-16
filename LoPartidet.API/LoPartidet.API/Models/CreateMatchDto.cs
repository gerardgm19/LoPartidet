namespace LoPartidet.API.Models;

public record CreateMatchDto(
    SportType Type,
    DateTime Date,
    string Location,
    string CreatedBy,
    int MaxPlayers
);
