namespace LoPartidet.API.Models;

public record ConversationDto(
    string Id,
    ConversationType Type,
    string? Name,
    string? LastMessage,
    DateTime? LastMessageAt,
    int ParticipantCount
);
