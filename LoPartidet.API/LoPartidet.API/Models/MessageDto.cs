namespace LoPartidet.API.Models;

public record MessageDto(
    string Id,
    string ConversationId,
    int SenderId,
    string SenderNickname,
    string Content,
    DateTime SentAt
);
