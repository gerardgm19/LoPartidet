namespace LoPartidet.API.Models;

public record CancelMatchValidationRequest(int MatchId, string IdentityId, bool IsAdmin);
