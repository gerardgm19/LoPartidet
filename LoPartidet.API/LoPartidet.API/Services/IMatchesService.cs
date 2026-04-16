using LoPartidet.API.Entities;
using LoPartidet.API.Models;

namespace LoPartidet.API.Services;

public interface IMatchesService
{
    IEnumerable<Match> GetAll();
    MatchDetailDto? GetById(int id);
    Task<Match> CreateMatch(CreateMatchDto request);
    Task<UserMatch> JoinMatchAsync(int matchId, int userId);
}
