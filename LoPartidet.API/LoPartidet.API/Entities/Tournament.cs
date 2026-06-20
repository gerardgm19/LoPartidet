using LoPartidet.API.Models.Enums;

namespace LoPartidet.API.Entities;

public class Tournament
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public SportType SportType { get; init; }
    public TournamentStatus Status { get; init; }
    public int CreatedById { get; init; }
    public DateTime StartDate { get; init; }
    public int GroupsCount { get; init; }
    public int TeamsPerGroup { get; init; }
    public int QualifiedPerGroup { get; init; }
    public bool IsSingleElimination { get; init; }
    public bool HasThirdPlaceMatch { get; init; }

    public User CreatedBy { get; init; } = null!;
    public ICollection<Team> Teams { get; set; } = [];
    public ICollection<TournamentGroup> Groups { get; set; } = [];
    public ICollection<TournamentMatch> Matches { get; set; } = [];
    public ICollection<TournamentLocation> Locations { get; set; } = [];
}
