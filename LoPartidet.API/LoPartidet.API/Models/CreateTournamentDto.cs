using LoPartidet.API.Models.Enums;

namespace LoPartidet.API.Models;

public record CreateTournamentDto(
    string Name,
    SportType SportType,
    string CreatedBy,
    DateTime StartDate,
    int GroupsCount,
    int TeamsPerGroup,
    int QualifiedPerGroup,
    bool IsSingleElimination,
    bool HasThirdPlaceMatch,
    int HalfDurationMinutes,
    int HalfTimeDurationMinutes,
    int GapBetweenMatchesMinutes
);
