using LoPartidet.API.Entities;
using LoPartidet.API.Models;

namespace LoPartidet.API.Services.Interfaces;

public interface IFriendshipService
{
    Task<Friendship> SendFriendRequestAsync(int requesterId, int addresseeId);
    Task<Friendship> AcceptFriendRequestAsync(string friendshipId, int userId);
    Task<Friendship> BlockUserAsync(string friendshipId, int userId);
    Task<IEnumerable<FriendDto>> GetFriendsAsync(int userId);
    Task<IEnumerable<PendingFriendRequestDto>> GetPendingRequestsAsync(int userId);
}
