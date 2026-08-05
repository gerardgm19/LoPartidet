namespace LoPartidet.API.Models;

public record DeleteMatchValidationRequest(int MatchId, string IdentityId, bool IsAdmin);
