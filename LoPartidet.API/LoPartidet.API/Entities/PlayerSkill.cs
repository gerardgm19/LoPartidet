using LoPartidet.API.Models;
using LoPartidet.API.Models.Enums;

namespace LoPartidet.API.Entities;

public class PlayerSkill
{
    public int Id { get; init; }
    public int UserId { get; init; }
    public User User { get; init; } = null!;
    public Position? Position { get; set; }
    public PreferredFoot? PreferredFoot { get; set; }
    public SkillLevel? SkillLevel { get; set; }
    public PlayerSpeed? Speed { get; set; }
    public int? JerseyNumber { get; set; }
    public int? Height { get; set; }
}
