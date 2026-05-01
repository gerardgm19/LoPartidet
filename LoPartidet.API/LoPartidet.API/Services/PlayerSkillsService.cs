using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Services.Interfaces;

namespace LoPartidet.API.Services;

public class PlayerSkillsService(LoPartidetContext db) : IPlayerSkillsService
{
    public IEnumerable<PlayerSkill> GetByUserId(int userId) =>
        db.PlayerSkills.Where(ps => ps.UserId == userId).ToList();

    public PlayerSkill Create(CreatePlayerSkillRequest request)
    {
        var existing = db.PlayerSkills.FirstOrDefault(ps => ps.UserId == request.UserId);
        if (existing is not null) return existing;

        var skill = new PlayerSkill
        {
            Id = Guid.NewGuid().ToString(),
            UserId = request.UserId,
            Position = request.Position,
            PreferredFoot = request.PreferredFoot,
            SkillLevel = request.SkillLevel,
            Speed = request.Speed,
            JerseyNumber = request.JerseyNumber,
            Height = request.Height,
        };

        db.PlayerSkills.Add(skill);
        db.SaveChanges();
        return skill;
    }

    public PlayerSkill? Update(string id, UpdatePlayerSkillRequest request)
    {
        var skill = db.PlayerSkills.Find(id);
        if (skill is null) return null;

        if (request.Position is not null) skill.Position = request.Position;
        if (request.PreferredFoot is not null) skill.PreferredFoot = request.PreferredFoot;
        if (request.SkillLevel is not null) skill.SkillLevel = request.SkillLevel;
        if (request.Speed is not null) skill.Speed = request.Speed;
        if (request.JerseyNumber is not null) skill.JerseyNumber = request.JerseyNumber;
        if (request.Height is not null) skill.Height = request.Height;

        db.SaveChanges();
        return skill;
    }
}
