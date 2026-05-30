using LoPartidet.API.Models.Enums;

namespace LoPartidet.API.Entities;

public class UserRole
{
    public int UserId { get; set; }
    public Role Role { get; set; }

    public User User { get; set; } = null!;
}
