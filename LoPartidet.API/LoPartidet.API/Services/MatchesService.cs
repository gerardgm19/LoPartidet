using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;

namespace LoPartidet.API.Services;

public class MatchesService(LoPartidetContext db) : IMatchesService
{
    public IEnumerable<Match> GetAll() => db.Matches.ToList();

    public Match? GetById(string id) => db.Matches.Find(id);

    public Match CreateMatch(CreateMatchDto request)
    {
        var match = new Match
        {
            Id = Guid.NewGuid().ToString(),
            Type = request.FootballType,
            Date = request.Date,
            Location = request.Location,
            CreatedBy = request.CreatedBy,
            CreatedAt = DateTime.UtcNow,
            Status = MatchStatus.Scheduled,
        };

        db.Matches.Add(match);
        db.SaveChanges();
        return match;
    }
}
