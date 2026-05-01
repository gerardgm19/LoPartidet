namespace LoPartidet.API.Models;

public record CreatePlayerSkillRequest(
    int UserId,
    Position? Position,
    PreferredFoot? PreferredFoot,
    SkillLevel? SkillLevel,
    PlayerSpeed? Speed,
    int? JerseyNumber,
    int? Height
);
