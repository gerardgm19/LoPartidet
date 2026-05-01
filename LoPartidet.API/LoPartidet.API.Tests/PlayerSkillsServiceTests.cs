using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Services;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LoPartidet.API.Tests;

public class PlayerSkillsServiceTests
{
    private static LoPartidetContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<LoPartidetContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new LoPartidetContext(options);
    }

    private static User MakeUser(int id = 1) => new()
    {
        Id = id,
        Name = "Test",
        Surname = "User",
        Nickname = "tuser",
        Email = "test@test.com",
        City = "Barcelona",
    };

    private static PlayerSkill MakeSkill(string id, int userId) => new()
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

    // GetByUserId

    [Fact]
    public void GetByUserId_NoSkills_ReturnsEmpty()
    {
        using var db = CreateContext();
        var svc = new PlayerSkillsService(db);

        var result = svc.GetByUserId(1);

        Assert.Empty(result);
    }

    [Fact]
    public void GetByUserId_HasSkills_ReturnsSkillsForUser()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        db.Users.Add(MakeUser(2));
        db.SaveChanges();
        db.PlayerSkills.Add(MakeSkill("skill-1", 1));
        db.PlayerSkills.Add(MakeSkill("skill-2", 1));
        db.PlayerSkills.Add(MakeSkill("skill-3", 2));
        db.SaveChanges();
        var svc = new PlayerSkillsService(db);

        var result = svc.GetByUserId(1).ToList();

        Assert.Equal(2, result.Count);
        Assert.All(result, s => Assert.Equal(1, s.UserId));
    }

    // Update

    [Fact]
    public void Update_SkillNotFound_ReturnsNull()
    {
        using var db = CreateContext();
        var svc = new PlayerSkillsService(db);
        var request = new UpdatePlayerSkillRequest(Position.GK, null, null, null, null, null);

        var result = svc.Update("nonexistent-id", request);

        Assert.Null(result);
    }

    [Fact]
    public void Update_AllFields_UpdatesAll()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        db.SaveChanges();
        db.PlayerSkills.Add(MakeSkill("skill-1", 1));
        db.SaveChanges();
        var svc = new PlayerSkillsService(db);
        var request = new UpdatePlayerSkillRequest(
            Position.GK, PreferredFoot.Left, SkillLevel.Expert, PlayerSpeed.Elite, 1, 190);

        var result = svc.Update("skill-1", request);

        Assert.NotNull(result);
        Assert.Equal(Position.GK, result.Position);
        Assert.Equal(PreferredFoot.Left, result.PreferredFoot);
        Assert.Equal(SkillLevel.Expert, result.SkillLevel);
        Assert.Equal(PlayerSpeed.Elite, result.Speed);
        Assert.Equal(1, result.JerseyNumber);
        Assert.Equal(190, result.Height);
    }

    [Fact]
    public void Update_PartialFields_OnlyUpdatesProvidedFields()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        db.SaveChanges();
        db.PlayerSkills.Add(MakeSkill("skill-1", 1));
        db.SaveChanges();
        var svc = new PlayerSkillsService(db);
        var request = new UpdatePlayerSkillRequest(Position.DEF, null, null, null, null, null);

        var result = svc.Update("skill-1", request);

        Assert.NotNull(result);
        Assert.Equal(Position.DEF, result.Position);
        Assert.Equal(PreferredFoot.Right, result.PreferredFoot);
        Assert.Equal(SkillLevel.Intermediate, result.SkillLevel);
        Assert.Equal(PlayerSpeed.Fast, result.Speed);
        Assert.Equal(10, result.JerseyNumber);
        Assert.Equal(180, result.Height);
    }

    [Fact]
    public void Update_PersistsChangesToDb()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        db.SaveChanges();
        db.PlayerSkills.Add(MakeSkill("skill-1", 1));
        db.SaveChanges();
        var svc = new PlayerSkillsService(db);
        var request = new UpdatePlayerSkillRequest(null, null, SkillLevel.Expert, null, null, 195);

        svc.Update("skill-1", request);

        var persisted = db.PlayerSkills.Find("skill-1");
        Assert.Equal(SkillLevel.Expert, persisted!.SkillLevel);
        Assert.Equal(195, persisted.Height);
    }
}
