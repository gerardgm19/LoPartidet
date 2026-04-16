namespace LoPartidet.API.Entities;

public class UserMatch
{
    public int UserId { get; set; }
    public int MatchId { get; set; }

    public User User { get; set; } = null!;
    public Match Match { get; set; } = null!;
}
