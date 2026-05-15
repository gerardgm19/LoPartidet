namespace LoPartidet.API.Models;

public record MatchDetailDto(
    int Id,
    int CreatedById,
    DateTime CreatedAt,
    SportType Type,
    DateTime Date,
    string Location,
    int MaxPlayers,
    int DurationInMinutes,
    MatchStatus Status,
    List<MatchPlayerDto> Players
);
