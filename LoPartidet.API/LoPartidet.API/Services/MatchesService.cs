using LoPartidet.API.Data;
using LoPartidet.API.Models;

namespace LoPartidet.API.Services;

public class MatchesService(LoPartidetContext db) : IMatchesService
{
    public IEnumerable<Match> GetAll() => db.Matches.ToList();

    public Match? GetById(string id) => db.Matches.Find(id);
}
