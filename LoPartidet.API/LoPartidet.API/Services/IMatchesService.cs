using LoPartidet.API.Entities;
using LoPartidet.API.Models;

namespace LoPartidet.API.Services;

public interface IMatchesService
{
    IEnumerable<Match> GetAll();
    Match? GetById(string id);
    Match CreateMatch(CreateMatchDto request);
}
