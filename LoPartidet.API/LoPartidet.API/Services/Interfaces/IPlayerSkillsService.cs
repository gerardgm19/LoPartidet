using LoPartidet.API.Models;

namespace LoPartidet.API.Services.Interfaces;

public interface IPlayerSkillsService
{
    Task<IEnumerable<PlayerSkillDto>> GetByUserIdAsync(int userId);
    Task<PlayerSkillDto> CreateAsync(CreatePlayerSkillRequest request);
    Task<PlayerSkillDto?> UpdateAsync(int id, UpdatePlayerSkillRequest request);
}
