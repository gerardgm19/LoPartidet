using LoPartidet.API.Models;

namespace LoPartidet.API.Services;

public interface IMatchesService
{
    Task<IEnumerable<MatchDto>> GetAllAsync(string identityId, MatchFilterDto filter);
    Task<MatchDetailDto?> GetByIdAsync(int id);
    Task<MatchDto> CreateMatchAsync(CreateMatchDto request);
    Task<UserMatchDto> JoinMatchAsync(int matchId, int userId);
    Task UnjoinMatchAsync(int matchId, int userId);
}
