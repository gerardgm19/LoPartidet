using LoPartidet.API.Entities;
using LoPartidet.API.Models;

namespace LoPartidet.API.Services.Interfaces;

public interface IConversationService
{
    Task<Conversation> CreateDirectConversationAsync(int user1Id, int user2Id);
    Task AddParticipantAsync(string conversationId, int userId);
    Task RemoveParticipantAsync(string conversationId, int userId);
    Task<IEnumerable<ConversationDto>> GetDirectConversationsAsync(int userId);
    Task<IEnumerable<ConversationDto>> GetGroupConversationsAsync(int userId);
    Task<bool> IsParticipantAsync(string conversationId, int userId);
}
