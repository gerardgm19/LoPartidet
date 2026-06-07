namespace LoPartidet.API.Entities;

public class Team
{
    public int Id { get; init; }
    public string Name { get; init; } = string.Empty;
    public int TournamentId { get; init; }
    public int? GroupId { get; init; }
    public int CreatedById { get; init; }
    public int MinPlayersPerTeam { get; init; }

    public Tournament Tournament { get; init; } = null!;
    public TournamentGroup? Group { get; init; }
    public User CreatedBy { get; init; } = null!;
    public ICollection<TeamMember> Members { get; set; } = [];
}
