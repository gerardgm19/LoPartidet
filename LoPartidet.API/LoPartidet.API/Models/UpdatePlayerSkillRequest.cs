using LoPartidet.API.Models.Enums;

namespace LoPartidet.API.Models;

public record UpdatePlayerSkillRequest(
    Position? Position,
    PreferredFoot? PreferredFoot,
    SkillLevel? SkillLevel,
    PlayerSpeed? Speed,
    int? JerseyNumber,
    int? Height
);
