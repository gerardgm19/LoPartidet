using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Services.Validators;

namespace LoPartidet.API.Services;

public class MatchesService(LoPartidetContext db, IMatchValidationService validationService) : IMatchesService
{
    public IEnumerable<Match> GetAll() => db.Matches.ToList();

    public Match? GetById(int id) => db.Matches.Find(id);

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
            CreatedBy = request.CreatedBy,
            CreatedAt = DateTime.UtcNow,
            MaxPlayers = request.MaxPlayers,
            Status = MatchStatus.Scheduled,
        };

        db.Matches.Add(match);
        await db.SaveChangesAsync();

        return match;
    }
}
