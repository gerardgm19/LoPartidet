using LoPartidet.API.Models;

namespace LoPartidet.API.Entities;

public class Friendship
{
    public string Id { get; set; } = string.Empty;
    public int RequesterId { get; set; }
    public int AddresseeId { get; set; }
    public FriendshipStatus Status { get; set; }
    public DateTime CreatedAt { get; set; }

    public User Requester { get; set; } = null!;
    public User Addressee { get; set; } = null!;
}
