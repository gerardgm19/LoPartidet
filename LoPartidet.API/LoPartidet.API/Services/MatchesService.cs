using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Services.Validators;

namespace LoPartidet.API.Services;

public class MatchesService(LoPartidetContext db, IMatchValidationService validationService) : IMatchesService
{
    public IEnumerable<Match> GetAll() => db.Matches.ToList();

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

    public async Task<Match> CreateMatch(CreateMatchDto request)
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

        return match;
    }

    public async Task<UserMatch> JoinMatchAsync(int matchId, int userId)
    {
        var userMatch = new UserMatch { MatchId = matchId, UserId = userId };
        db.UserMatches.Add(userMatch);
        await db.SaveChangesAsync();
        return userMatch;
    }
}
