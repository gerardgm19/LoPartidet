namespace LoPartidet.API.Entities;

public class TeamMember
{
    public int Id { get; init; }
    public int TeamId { get; init; }
    public int UserId { get; init; }

    public Team Team { get; init; } = null!;
    public User User { get; init; } = null!;
}
