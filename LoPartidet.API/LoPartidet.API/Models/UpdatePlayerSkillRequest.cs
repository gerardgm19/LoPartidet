namespace LoPartidet.API.Models;

public record UpdatePlayerSkillRequest(
    Position? Position,
    PreferredFoot? PreferredFoot,
    SkillLevel? SkillLevel,
    PlayerSpeed? Speed,
    int? JerseyNumber,
    int? Height
);
