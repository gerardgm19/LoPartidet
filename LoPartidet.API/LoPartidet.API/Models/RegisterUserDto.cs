namespace LoPartidet.API.Models;

public record RegisterUserDto(
    string Name,
    string Surname,
    string Nickname,
    string Email,
    string Password,
    string City,
    DateTime? Birthday,
    Position? Position,
    PreferredFoot? PreferredFoot,
    SkillLevel? SkillLevel,
    PlayerSpeed? Speed,
    int? JerseyNumber,
    int? Height
);
