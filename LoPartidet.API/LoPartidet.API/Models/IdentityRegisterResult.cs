namespace LoPartidet.API.Models;

public record IdentityRegisterResult(bool Succeeded, IdentityRegisterResponse? Response, string? Error);
