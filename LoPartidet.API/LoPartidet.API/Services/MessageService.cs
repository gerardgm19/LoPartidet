using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LoPartidet.API.Services;

public class MessageService(LoPartidetContext db, IPushNotificationService pushService) : IMessageService
{
    public async Task<MessageDto> SendMessageAsync(string conversationId, int senderId, string content)
    {
        var sender = await db.Users.FindAsync(senderId)
            ?? throw new InvalidOperationException("Sender not found.");

        var message = new Message
        {
            Id = Guid.NewGuid().ToString(),
            ConversationId = conversationId,
            SenderId = senderId,
            Content = content,
            SentAt = DateTime.UtcNow
        };

        db.Messages.Add(message);
        await db.SaveChangesAsync();

        var dto = new MessageDto(message.Id, message.ConversationId, message.SenderId, sender.Nickname, message.Content, message.SentAt);

        var pushTokens = await db.ConversationParticipants
            .Where(cp => cp.ConversationId == conversationId && cp.UserId != senderId)
            .Include(cp => cp.User)
            .Select(cp => cp.User.ExpoPushToken)
            .Where(token => token != null)
            .Cast<string>()
            .ToListAsync();

        if (pushTokens.Count != 0)
            await pushService.SendAsync(pushTokens, $"New message from {sender.Nickname}", content);

        return dto;
    }

    public async Task<IEnumerable<MessageDto>> GetMessagesAsync(string conversationId, int page, int pageSize)
    {
        return await db.Messages
            .Where(m => m.ConversationId == conversationId)
            .OrderByDescending(m => m.SentAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(m => new MessageDto(m.Id, m.ConversationId, m.SenderId, m.Sender.Nickname, m.Content, m.SentAt))
            .ToListAsync();
    }
}
