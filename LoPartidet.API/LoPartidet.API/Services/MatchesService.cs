using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Services.Validators;
using Microsoft.EntityFrameworkCore;

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

        var creatorId = int.Parse(request.CreatedBy);
        var conversationId = Guid.NewGuid().ToString();

        db.Conversations.Add(new Conversation
        {
            Id = conversationId,
            Type = ConversationType.Group,
            Name = request.Location,
        });
        db.ConversationParticipants.Add(new ConversationParticipant
        {
            ConversationId = conversationId,
            UserId = creatorId,
            JoinedAt = DateTime.UtcNow
        });

        var match = new Match
        {
            Type = request.Type,
            Date = request.Date,
            Location = request.Location,
            CreatedById = creatorId,
            CreatedAt = DateTime.UtcNow,
            MaxPlayers = request.MaxPlayers,
            Status = MatchStatus.Scheduled,
            ConversationId = conversationId
        };

        db.Matches.Add(match);
        await db.SaveChangesAsync();

        return match;
    }

    public async Task<UserMatch> JoinMatchAsync(int matchId, int userId)
    {
        var userMatch = new UserMatch { MatchId = matchId, UserId = userId };
        db.UserMatches.Add(userMatch);

        var match = await db.Matches.FindAsync(matchId);
        if (match?.ConversationId is not null)
        {
            var already = await db.ConversationParticipants
                .AnyAsync(cp => cp.ConversationId == match.ConversationId && cp.UserId == userId);
            if (!already)
                db.ConversationParticipants.Add(new ConversationParticipant
                {
                    ConversationId = match.ConversationId,
                    UserId = userId,
                    JoinedAt = DateTime.UtcNow
                });
        }

        await db.SaveChangesAsync();
        return userMatch;
    }

    public async Task UnjoinMatchAsync(int matchId, int userId)
    {
        var userMatch = db.UserMatches.First(um => um.MatchId == matchId && um.UserId == userId);
        db.UserMatches.Remove(userMatch);

        var match = await db.Matches.FindAsync(matchId);
        if (match?.ConversationId is not null)
        {
            var participant = await db.ConversationParticipants
                .FirstOrDefaultAsync(cp => cp.ConversationId == match.ConversationId && cp.UserId == userId);
            if (participant is not null)
                db.ConversationParticipants.Remove(participant);
        }

        await db.SaveChangesAsync();
    }
}
