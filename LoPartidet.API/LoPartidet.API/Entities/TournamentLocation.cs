namespace LoPartidet.API.Entities;

public class TournamentLocation
{
    public int Id { get; init; }
    public int TournamentId { get; init; }
    public int LocationId { get; init; }

    public Tournament Tournament { get; init; } = null!;
    public Location Location { get; init; } = null!;
    public ICollection<TournamentMatch> Matches { get; set; } = [];
}
