using LoPartidet.API.Data;
using LoPartidet.API.Entities;

namespace LoPartidet.API.Services;

public class MatchesService(LoPartidetContext db) : IMatchesService
{
    public IEnumerable<Match> GetAll() => db.Matches.ToList();

    public Match? GetById(string id) => db.Matches.Find(id);
}
