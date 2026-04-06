namespace IdentityManager.Models;

public record RegisterRequest(
    string Email,
    string Password,
    string Name,
    string Surname,
    string Nickname
);
