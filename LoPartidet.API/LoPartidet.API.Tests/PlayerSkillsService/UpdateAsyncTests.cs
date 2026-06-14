using LoPartidet.API.Models;
using LoPartidet.API.Models.Enums;
using Xunit;

namespace LoPartidet.API.Tests.PlayerSkillsService;

public class UpdateAsyncTests : PlayerSkillsServiceTestBase
{
    [Fact]
    public async Task Update_SkillNotFound_ReturnsNull()
    {
        using var db = CreateContext();
        var svc = new API.Services.PlayerSkillsService(db);
        var request = new UpdatePlayerSkillRequest(Position.GK, null, null, null, null, null);

        var result = await svc.UpdateAsync(999, request);

        Assert.Null(result);
    }

    [Fact]
    public async Task Update_AllFields_UpdatesAll()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        await db.SaveChangesAsync();
        db.PlayerSkills.Add(MakeSkill(1, 1));
        await db.SaveChangesAsync();
        var svc = new API.Services.PlayerSkillsService(db);
        var request = new UpdatePlayerSkillRequest(
            Position.GK, PreferredFoot.Left, SkillLevel.Expert, PlayerSpeed.Elite, 1, 190);

        var result = await svc.UpdateAsync(1, request);

        Assert.NotNull(result);
        Assert.Equal(Position.GK, result.Position);
        Assert.Equal(PreferredFoot.Left, result.PreferredFoot);
        Assert.Equal(SkillLevel.Expert, result.SkillLevel);
        Assert.Equal(PlayerSpeed.Elite, result.Speed);
        Assert.Equal(1, result.JerseyNumber);
        Assert.Equal(190, result.Height);
    }

    [Fact]
    public async Task Update_PartialFields_OnlyUpdatesProvidedFields()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        await db.SaveChangesAsync();
        db.PlayerSkills.Add(MakeSkill(1, 1));
        await db.SaveChangesAsync();
        var svc = new API.Services.PlayerSkillsService(db);
        var request = new UpdatePlayerSkillRequest(Position.DEF, null, null, null, null, null);

        var result = await svc.UpdateAsync(1, request);

        Assert.NotNull(result);
        Assert.Equal(Position.DEF, result.Position);
        Assert.Equal(PreferredFoot.Right, result.PreferredFoot);
        Assert.Equal(SkillLevel.Intermediate, result.SkillLevel);
        Assert.Equal(PlayerSpeed.Fast, result.Speed);
        Assert.Equal(10, result.JerseyNumber);
        Assert.Equal(180, result.Height);
    }

    [Fact]
    public async Task Update_PersistsChangesToDb()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        await db.SaveChangesAsync();
        db.PlayerSkills.Add(MakeSkill(1, 1));
        await db.SaveChangesAsync();
        var svc = new API.Services.PlayerSkillsService(db);
        var request = new UpdatePlayerSkillRequest(null, null, SkillLevel.Expert, null, null, 195);

        await svc.UpdateAsync(1, request);

        var persisted = await db.PlayerSkills.FindAsync(1);
        Assert.Equal(SkillLevel.Expert, persisted!.SkillLevel);
        Assert.Equal(195, persisted.Height);
    }
}
