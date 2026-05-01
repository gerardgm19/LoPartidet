namespace LoPartidet.API.Models;

public record PendingFriendRequestDto(
    string Id,
    int RequesterId,
    string RequesterName,
    string RequesterNickname
);
