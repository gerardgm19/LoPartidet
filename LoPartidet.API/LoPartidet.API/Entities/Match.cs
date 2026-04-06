using LoPartidet.API.Models;

namespace LoPartidet.API.Entities;

public class Match
{
    public string Id { get; init; } = string.Empty;
    public FootballType FootballType { get; init; }
    public DateTime Date { get; init; }
    public string Location { get; init; } = string.Empty;
    public string Organizer { get; init; } = string.Empty;
    public int JoinedCount { get; init; }
    public int MaxPeople { get; init; }
    public bool IsJoined { get; init; }
    public MatchStatus Status { get; init; }
}
