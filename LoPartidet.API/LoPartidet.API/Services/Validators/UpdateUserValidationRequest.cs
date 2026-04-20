namespace LoPartidet.API.Services.Validators;

public record UpdateUserValidationRequest(int UserId, string? Name, string? Surname, string? Nickname, string? Email);
