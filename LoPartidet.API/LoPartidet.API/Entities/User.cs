using LoPartidet.API.Models;

namespace LoPartidet.API.Entities;

public class User
{
    public int Id { get; set; }
    public string IdentityId { get; set; } = string.Empty;
    public string Name { get; set; } = string.Empty;
    public string Surname { get; set; } = string.Empty;
    public string Nickname { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public string City { get; set; } = string.Empty;
    public DateTime? Birthday { get; set; }
    public Position? Position { get; set; }
    public PreferredFoot? PreferredFoot { get; set; }
    public SkillLevel? SkillLevel { get; set; }
    public PlayerSpeed? Speed { get; set; }
    public int? JerseyNumber { get; set; }
    public int? Height { get; set; }

    public ICollection<UserMatch> UserMatches { get; set; } = [];
}
