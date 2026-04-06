using LoPartidet.API.Entities;

namespace LoPartidet.API.Services;

public interface IMatchesService
{
    IEnumerable<Match> GetAll();
    Match? GetById(string id);
}
