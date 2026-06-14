using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoPartidet.API.Tests.PlayerSkillsService;

public abstract class PlayerSkillsServiceTestBase
{
    protected static LoPartidetContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<LoPartidetContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new LoPartidetContext(options);
    }

    protected static User MakeUser(int id = 1) => new()
    {
        Id = id,
        Name = "Test",
        Surname = "User",
        Nickname = "tuser",
        Email = "test@test.com",
        City = "Barcelona",
    };

    protected static PlayerSkill MakeSkill(int id, int userId) => new()
    {
        Id = id,
        UserId = userId,
        Position = Position.FWD,
        PreferredFoot = PreferredFoot.Right,
        SkillLevel = SkillLevel.Intermediate,
        Speed = PlayerSpeed.Fast,
        JerseyNumber = 10,
        Height = 180,
    };
}
