using LoPartidet.API.Models;

namespace LoPartidet.API.Entities;

public class TournamentMatch
{
    public int Id { get; init; }
    public int CreatedById { get; init; }
    public DateTime CreatedAt { get; init; }
    public DateTime Date { get; init; }
    public string Location { get; init; } = string.Empty;
    public MatchStatus Status { get; init; }

    public int TournamentId { get; init; }
    public int? GroupId { get; init; }
    public int? TeamAId { get; init; }
    public int? TeamBId { get; init; }
    public int? RefereeId { get; init; }
    public DateTime? ResultSubmittedAt { get; init; }
    public int HalfDuration { get; init; }
    public int HalfTimeDuration { get; init; }

    public User CreatedBy { get; init; } = null!;
    public Tournament Tournament { get; init; } = null!;
    public TournamentGroup? Group { get; init; }
    public Team? TeamA { get; init; }
    public Team? TeamB { get; init; }
    public User? Referee { get; init; }
    public ICollection<MatchEvent> Events { get; set; } = [];
}
