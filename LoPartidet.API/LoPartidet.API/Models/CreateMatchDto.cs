namespace LoPartidet.API.Models;

public record CreateMatchDto(
    SportType FootballType,
    DateTime Date,
    string Location,
    string CreatedBy,
    int MaxPlayers
);
