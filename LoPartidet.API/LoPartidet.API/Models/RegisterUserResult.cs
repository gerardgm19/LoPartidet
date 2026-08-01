namespace LoPartidet.API.Models;

public record RegisterUserResult(bool Succeeded, RegisterUserResponse? Response, string? Error);
