namespace LoPartidet.API.Entities;

public class UserMatch
{
    public string UserId { get; set; } = string.Empty;
    public string MatchId { get; set; } = string.Empty;

    public User User { get; set; } = null!;
    public Match Match { get; set; } = null!;
}
