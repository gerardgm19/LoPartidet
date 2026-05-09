using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Services.Validators;

namespace LoPartidet.API.Services;

public class MatchesService(LoPartidetContext db, IMatchValidationService validationService) : IMatchesService
{
    public IEnumerable<MatchDto> GetAll() =>
        db.Matches
            .Select(m => new MatchDto(
                m.Id, m.CreatedById, m.CreatedAt, m.Type, m.Date, m.Location, m.MaxPlayers, m.Status))
            .ToList();

    public MatchDetailDto? GetById(int id)
    {
        var match = db.Matches.Find(id);
        if (match is null) return null;

        var players = db.UserMatches
            .Where(um => um.MatchId == id)
            .Select(um => new MatchPlayerDto(um.User.Id, um.User.Name, um.User.Surname, um.User.Nickname))
            .ToList();

        return new MatchDetailDto(
            match.Id,
            match.CreatedById,
            match.CreatedAt,
            match.Type,
            match.Date,
            match.Location,
            match.MaxPlayers,
            match.Status,
            players
        );
    }

    public async Task<MatchDto> CreateMatch(CreateMatchDto request)
    {
        var validation = await validationService.ValidateCreateMatchAsync(request);
        if (!validation.IsValid)
            throw new InvalidOperationException(validation.Error);

        var match = new Match
        {
            Type = request.Type,
            Date = request.Date,
            Location = request.Location,
            CreatedById = int.Parse(request.CreatedBy),
            CreatedAt = DateTime.UtcNow,
            MaxPlayers = request.MaxPlayers,
            Status = MatchStatus.Scheduled,
        };

        db.Matches.Add(match);
        await db.SaveChangesAsync();

        return new MatchDto(
            match.Id, match.CreatedById, match.CreatedAt, match.Type,
            match.Date, match.Location, match.MaxPlayers, match.Status);
    }

    public async Task<UserMatchDto> JoinMatchAsync(int matchId, int userId)
    {
        var userMatch = new UserMatch { MatchId = matchId, UserId = userId };
        db.UserMatches.Add(userMatch);
        await db.SaveChangesAsync();
        return new UserMatchDto(userMatch.UserId, userMatch.MatchId);
    }

    public async Task UnjoinMatchAsync(int matchId, int userId)
    {
        var userMatch = db.UserMatches.First(um => um.MatchId == matchId && um.UserId == userId);
        db.UserMatches.Remove(userMatch);
        await db.SaveChangesAsync();
    }
}
