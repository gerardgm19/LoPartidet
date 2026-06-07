using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Services.Interfaces;
using LoPartidet.API.Services.Validators;
using LoPartidet.API.Services.Validators.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LoPartidet.API.Services;

public class MatchesService(LoPartidetContext db, IMatchValidationService validationService) : IMatchesService
{
    public async Task<IEnumerable<MatchDto>> GetAllAsync(string identityId, MatchFilterDto filter)
    {
        var userId = await db.Users.Where(u => u.IdentityId == identityId).Select(u => u.Id).FirstOrDefaultAsync();

        var minDate = filter.MinDate ?? DateTime.UtcNow;
        var query = db.Matches.Where(m => m.Date >= minDate);

        if (!string.IsNullOrWhiteSpace(filter.Location))
            query = query.Where(m => m.Location.Name.Contains(filter.Location));

        if (filter.MaxDate.HasValue)
            query = query.Where(m => m.Date <= filter.MaxDate.Value);

        if (filter.MinTime.HasValue)
        {
            var minMinutes = filter.MinTime.Value.Hour * 60 + filter.MinTime.Value.Minute;
            query = query.Where(m => m.Date.Hour * 60 + m.Date.Minute >= minMinutes);
        }

        if (filter.MaxTime.HasValue)
        {
            var maxMinutes = filter.MaxTime.Value.Hour * 60 + filter.MaxTime.Value.Minute;
            query = query.Where(m => m.Date.Hour * 60 + m.Date.Minute <= maxMinutes);
        }

        if (filter.Joined.HasValue)
        {
            query = filter.Joined.Value
                ? query.Where(m => m.JoinedUsers.Any(um => um.UserId == userId))
                : query.Where(m => !m.JoinedUsers.Any(um => um.UserId == userId));
        }

        return await query
            .Select(m => new MatchDto(
                m.Id,
                m.CreatedById,
                m.CreatedAt,
                m.Type,
                m.Date,
                m.Location.Name,
                m.MaxPlayers,
                m.DurationInMinutes,
                m.Status,
                m.JoinedUsers.Any(um => um.UserId == userId)
            ))
            .ToListAsync();
    }

    public async Task<MatchDetailDto?> GetByIdAsync(int id)
    {
        var match = await db.Matches
            .Include(m => m.Location)
            .FirstOrDefaultAsync(m => m.Id == id);
        if (match is null) return null;

        var players = await db.UserMatches
            .Where(um => um.MatchId == id)
            .Select(um => new MatchPlayerDto(um.User.Id, um.User.Name, um.User.Surname, um.User.Nickname))
            .ToListAsync();

        return new MatchDetailDto(
            match.Id,
            match.CreatedById,
            match.CreatedAt,
            match.Type,
            match.Date,
            match.Location.Name,
            match.MaxPlayers,
            match.DurationInMinutes,
            match.Status,
            players
        );
    }

    public async Task<MatchDto> CreateMatchAsync(CreateMatchDto request)
    {
        var validation = await validationService.ValidateCreateMatchAsync(request);
        if (!validation.IsValid)
            throw new InvalidOperationException(validation.Error);

        // ToDo: select available Location from frontend
        var locationId = await GetOrCreateLocationIdAsync(request.Location);

        var match = new Match
        {
            Type = request.Type,
            Date = request.Date,
            LocationId = locationId,
            CreatedById = int.Parse(request.CreatedBy),
            CreatedAt = DateTime.UtcNow,
            MaxPlayers = request.MaxPlayers,
            DurationInMinutes = request.DurationInMinutes,
            Status = MatchStatus.Scheduled,
        };

        db.Matches.Add(match);
        await db.SaveChangesAsync();

        return new MatchDto(
            match.Id, match.CreatedById, match.CreatedAt, match.Type,
            match.Date, request.Location, match.MaxPlayers, match.DurationInMinutes, match.Status,
            false);
    }

    private async Task<int> GetOrCreateLocationIdAsync(string name)
    {
        var trimmed = name.Trim();
        var existing = await db.Locations
            .Where(l => l.Name == trimmed)
            .Select(l => (int?)l.Id)
            .FirstOrDefaultAsync();
        if (existing.HasValue) return existing.Value;

        var location = new Location { Name = trimmed };
        db.Locations.Add(location);
        await db.SaveChangesAsync();
        return location.Id;
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
        var userMatch = await db.UserMatches.FirstAsync(um => um.MatchId == matchId && um.UserId == userId);
        db.UserMatches.Remove(userMatch);
        await db.SaveChangesAsync();
    }
}
