namespace LoPartidet.API.Models;

public record UserDto(
    int Id,
    string Name,
    string Surname,
    string Nickname,
    string Email,
    string City,
    DateTime? Birthday
);
