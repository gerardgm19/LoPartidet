using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LoPartidet.API.Services;

public class FriendshipService(LoPartidetContext db, IConversationService conversationService) : IFriendshipService
{
    public async Task<Friendship> SendFriendRequestAsync(int requesterId, int addresseeId)
    {
        var existing = await db.Friendships.FirstOrDefaultAsync(f =>
            (f.RequesterId == requesterId && f.AddresseeId == addresseeId) ||
            (f.RequesterId == addresseeId && f.AddresseeId == requesterId));

        if (existing is not null)
            throw new InvalidOperationException("Friend request already exists.");

        var friendship = new Friendship
        {
            Id = Guid.NewGuid().ToString(),
            RequesterId = requesterId,
            AddresseeId = addresseeId,
            Status = FriendshipStatus.Pending,
            CreatedAt = DateTime.UtcNow,
        };

        db.Friendships.Add(friendship);
        await db.SaveChangesAsync();
        return friendship;
    }

    public async Task<Friendship> AcceptFriendRequestAsync(string friendshipId, int userId)
    {
        var friendship = await db.Friendships.FindAsync(friendshipId)
            ?? throw new InvalidOperationException("Friend request not found.");

        if (friendship.AddresseeId != userId)
            throw new InvalidOperationException("Not authorized.");

        friendship.Status = FriendshipStatus.Accepted;
        await db.SaveChangesAsync();

        await conversationService.CreateDirectConversationAsync(friendship.RequesterId, friendship.AddresseeId);

        return friendship;
    }

    public async Task<Friendship> BlockUserAsync(string friendshipId, int userId)
    {
        var friendship = await db.Friendships.FindAsync(friendshipId)
            ?? throw new InvalidOperationException("Friendship not found.");

        if (friendship.RequesterId != userId && friendship.AddresseeId != userId)
            throw new InvalidOperationException("Not authorized.");

        friendship.Status = FriendshipStatus.Blocked;
        await db.SaveChangesAsync();
        return friendship;
    }

    public async Task<IEnumerable<FriendDto>> GetFriendsAsync(int userId)
    {
        var friendships = await db.Friendships
            .Where(f => (f.RequesterId == userId || f.AddresseeId == userId) && f.Status == FriendshipStatus.Accepted)
            .Include(f => f.Requester)
            .Include(f => f.Addressee)
            .ToListAsync();

        var directConversations = await db.ConversationParticipants
            .Where(cp => cp.UserId == userId)
            .Select(cp => cp.Conversation)
            .Where(c => c.Type == ConversationType.Direct)
            .Include(c => c.Participants)
            .ToListAsync();

        return friendships.Select(f =>
        {
            var friend = f.RequesterId == userId ? f.Addressee : f.Requester;
            var directConv = directConversations
                .FirstOrDefault(c => c.Participants.Any(p => p.UserId == friend.Id));
            return new FriendDto(friend.Id, friend.Name, friend.Surname, friend.Nickname, directConv?.Id, f.Id);
        });
    }

    public async Task<IEnumerable<PendingFriendRequestDto>> GetPendingRequestsAsync(int userId)
    {
        return await db.Friendships
            .Where(f => f.AddresseeId == userId && f.Status == FriendshipStatus.Pending)
            .Include(f => f.Requester)
            .Select(f => new PendingFriendRequestDto(f.Id, f.RequesterId, f.Requester.Name, f.Requester.Nickname))
            .ToListAsync();
    }
}
