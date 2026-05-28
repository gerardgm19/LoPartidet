using LoPartidet.API.Models;

namespace LoPartidet.API.Entities;

public class UserRole
{
    public int UserId { get; set; }
    public Role Role { get; set; }

    public User User { get; set; } = null!;
}
