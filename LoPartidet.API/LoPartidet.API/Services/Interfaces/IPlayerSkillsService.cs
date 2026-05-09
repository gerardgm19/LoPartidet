using LoPartidet.API.Models;

namespace LoPartidet.API.Services.Interfaces;

public interface IPlayerSkillsService
{
    IEnumerable<PlayerSkillDto> GetByUserId(int userId);
    PlayerSkillDto Create(CreatePlayerSkillRequest request);
    PlayerSkillDto? Update(int id, UpdatePlayerSkillRequest request);
}
