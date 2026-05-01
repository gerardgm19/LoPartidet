namespace LoPartidet.API.Models;

public record FriendDto(
    int Id,
    string Name,
    string Surname,
    string Nickname,
    string? DirectConversationId,
    string FriendshipId
);
