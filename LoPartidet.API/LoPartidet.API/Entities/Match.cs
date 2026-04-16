using LoPartidet.API.Models;

namespace LoPartidet.API.Entities;

public class Match
{
    public int Id { get; init; }
    public string CreatedBy { get; init; } = string.Empty;
    public DateTime CreatedAt { get; init; }
    public SportType Type { get; init; }
    public DateTime Date { get; init; }
    public string Location { get; init; } = string.Empty;
    //public int JoinedCount { get; init; }
    public int MaxPlayers { get; init; }
    public MatchStatus Status { get; init; }
}
