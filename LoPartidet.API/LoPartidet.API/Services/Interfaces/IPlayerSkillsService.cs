using LoPartidet.API.Entities;
using LoPartidet.API.Models;

namespace LoPartidet.API.Services.Interfaces;

public interface IPlayerSkillsService
{
    IEnumerable<PlayerSkill> GetByUserId(int userId);
    PlayerSkill Create(CreatePlayerSkillRequest request);
    PlayerSkill? Update(int id, UpdatePlayerSkillRequest request);
}
