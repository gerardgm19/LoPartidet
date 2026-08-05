namespace LoPartidet.API.Models;

public record UpdateMatchValidationRequest(
    int MatchId,
    string IdentityId,
    bool IsAdmin,
    DateTime Date,
    string Location,
    int MaxPlayers,
    int DurationInMinutes
);
