using LoPartidet.API.Models;

namespace LoPartidet.API.Entities;

public class MatchEvent
{
    public int Id { get; init; }
    public int MatchId { get; init; }
    public int UserId { get; init; }
    public int TeamId { get; init; }
    public EventType Type { get; init; }
    public int Minute { get; init; }
    public int RefereeId { get; init; }

    public TournamentMatch Match { get; init; } = null!;
    public User User { get; init; } = null!;
    public Team Team { get; init; } = null!;
    public User Referee { get; init; } = null!;
}
