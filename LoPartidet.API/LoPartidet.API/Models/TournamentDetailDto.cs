using LoPartidet.API.Models.Enums;

namespace LoPartidet.API.Models;

public record TournamentDetailDto(
    int Id,
    string Name,
    SportType SportType,
    TournamentStatus Status,
    int CreatedById,
    DateTime StartDate,
    int GroupsCount,
    int TeamsPerGroup,
    int QualifiedPerGroup,
    bool IsSingleElimination,
    bool HasThirdPlaceMatch,
    int HalfDurationMinutes,
    int HalfTimeDurationMinutes,
    int GapBetweenMatchesMinutes,
    bool IsCurrentUserInTeam
);
