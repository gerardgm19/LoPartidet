using Xunit;

namespace LoPartidet.API.Tests.PlayerSkillsService;

public class GetByUserIdAsyncTests : PlayerSkillsServiceTestBase
{
    [Fact]
    public async Task GetByUserId_NoSkills_ReturnsEmpty()
    {
        using var db = CreateContext();
        var svc = new API.Services.PlayerSkillsService(db);

        var result = await svc.GetByUserIdAsync(1);

        Assert.Empty(result);
    }

    [Fact]
    public async Task GetByUserId_HasSkills_ReturnsSkillsForUser()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        db.Users.Add(MakeUser(2));
        await db.SaveChangesAsync();
        db.PlayerSkills.Add(MakeSkill(1, 1));
        db.PlayerSkills.Add(MakeSkill(2, 1));
        db.PlayerSkills.Add(MakeSkill(3, 2));
        await db.SaveChangesAsync();
        var svc = new API.Services.PlayerSkillsService(db);

        var result = (await svc.GetByUserIdAsync(1)).ToList();

        Assert.Equal(2, result.Count);
        Assert.All(result, s => Assert.Equal(1, s.UserId));
    }
}
