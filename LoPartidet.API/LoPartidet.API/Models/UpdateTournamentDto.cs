using LoPartidet.API.Models.Enums;

namespace LoPartidet.API.Models;

public record UpdateTournamentDto(
    string Name,
    SportType SportType,
    DateTime StartDate,
    int GroupsCount,
    int TeamsPerGroup,
    int QualifiedPerGroup,
    bool IsSingleElimination,
    bool HasThirdPlaceMatch,
    int HalfDurationMinutes,
    int HalfTimeDurationMinutes,
    int GapBetweenMatchesMinutes,
    IReadOnlyList<int> LocationIds
);
