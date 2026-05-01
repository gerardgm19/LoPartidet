using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LoPartidet.API.Services;

public class ConversationService(LoPartidetContext db) : IConversationService
{
    public async Task<Conversation> CreateDirectConversationAsync(int user1Id, int user2Id)
    {
        var conversation = new Conversation
        {
            Id = Guid.NewGuid().ToString(),
            Type = ConversationType.Direct,
            Participants =
            [
                new ConversationParticipant { UserId = user1Id, JoinedAt = DateTime.UtcNow },
                new ConversationParticipant { UserId = user2Id, JoinedAt = DateTime.UtcNow },
            ]
        };

        db.Conversations.Add(conversation);
        await db.SaveChangesAsync();
        return conversation;
    }

    public async Task AddParticipantAsync(string conversationId, int userId)
    {
        var already = await db.ConversationParticipants
            .AnyAsync(cp => cp.ConversationId == conversationId && cp.UserId == userId);
        if (already) return;

        db.ConversationParticipants.Add(new ConversationParticipant
        {
            ConversationId = conversationId,
            UserId = userId,
            JoinedAt = DateTime.UtcNow
        });
        await db.SaveChangesAsync();
    }

    public async Task RemoveParticipantAsync(string conversationId, int userId)
    {
        var participant = await db.ConversationParticipants
            .FirstOrDefaultAsync(cp => cp.ConversationId == conversationId && cp.UserId == userId);
        if (participant is null) return;

        db.ConversationParticipants.Remove(participant);
        await db.SaveChangesAsync();
    }

    public Task<IEnumerable<ConversationDto>> GetDirectConversationsAsync(int userId)
        => GetConversationsAsync(userId, ConversationType.Direct);

    public Task<IEnumerable<ConversationDto>> GetGroupConversationsAsync(int userId)
        => GetConversationsAsync(userId, ConversationType.Group);

    public async Task<bool> IsParticipantAsync(string conversationId, int userId)
        => await db.ConversationParticipants.AnyAsync(cp => cp.ConversationId == conversationId && cp.UserId == userId);

    private async Task<IEnumerable<ConversationDto>> GetConversationsAsync(int userId, ConversationType type)
    {
        var convIds = await db.ConversationParticipants
            .Where(cp => cp.UserId == userId)
            .Select(cp => cp.ConversationId)
            .ToListAsync();

        var conversations = await db.Conversations
            .Where(c => convIds.Contains(c.Id) && c.Type == type)
            .Include(c => c.Participants)
            .Include(c => c.Messages.OrderByDescending(m => m.SentAt).Take(1))
            .ToListAsync();

        return conversations.Select(c =>
        {
            var last = c.Messages.FirstOrDefault();
            return new ConversationDto(c.Id, c.Type, c.Name, last?.Content, last?.SentAt, c.Participants.Count);
        });
    }
}
