using LoPartidet.API.Models;

namespace LoPartidet.API.Services;

public interface IMatchesService
{
    IEnumerable<MatchDto> GetAll();
    MatchDetailDto? GetById(int id);
    Task<MatchDto> CreateMatch(CreateMatchDto request);
    Task<UserMatchDto> JoinMatchAsync(int matchId, int userId);
    Task UnjoinMatchAsync(int matchId, int userId);
}
