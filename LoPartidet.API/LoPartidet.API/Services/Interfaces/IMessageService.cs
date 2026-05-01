using LoPartidet.API.Models;

namespace LoPartidet.API.Services.Interfaces;

public interface IMessageService
{
    Task<MessageDto> SendMessageAsync(string conversationId, int senderId, string content);
    Task<IEnumerable<MessageDto>> GetMessagesAsync(string conversationId, int page, int pageSize);
}
