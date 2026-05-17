namespace LoPartidet.API.Models;

public record MatchFilterDto(
    string? Location,
    bool? Joined,
    DateTime? MinDate,
    DateTime? MaxDate,
    TimeOnly? MinTime,
    TimeOnly? MaxTime
);
