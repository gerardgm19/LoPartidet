using LoPartidet.API.Models;
using LoPartidet.API.Models.Enums;
using Xunit;

namespace LoPartidet.API.Tests.MatchValidationService;

public class ValidateCreateMatchAsyncTests : MatchValidationServiceTestBase
{
    [Fact]
    public async Task ValidateCreateMatch_UserNotFound_ReturnsFail()
    {
        using var db = CreateContext();
        var svc = new API.Services.Validators.MatchValidationService(db);
        var request = new CreateMatchDto(SportType.Fut5, DateTime.UtcNow.AddDays(1), "Field A", "999", 10, 90);

        var result = await svc.ValidateCreateMatchAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("User not found.", result.Error);
    }

    [Fact]
    public async Task ValidateCreateMatch_PastDate_ReturnsFail()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db);
        var request = new CreateMatchDto(SportType.Fut5, DateTime.UtcNow.AddDays(-1), "Field A", "1", 10, 90);

        var result = await svc.ValidateCreateMatchAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Match date must be in the future.", result.Error);
    }

    [Fact]
    public async Task ValidateCreateMatch_EmptyLocation_ReturnsFail()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db);
        var request = new CreateMatchDto(SportType.Fut5, DateTime.UtcNow.AddDays(1), "   ", "1", 10, 90);

        var result = await svc.ValidateCreateMatchAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Location is required.", result.Error);
    }

    [Fact]
    public async Task ValidateCreateMatch_MaxPlayersLessThanTwo_ReturnsFail()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db);
        var request = new CreateMatchDto(SportType.Fut5, DateTime.UtcNow.AddDays(1), "Field A", "1", 1, 90);

        var result = await svc.ValidateCreateMatchAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("A match requires at least 2 players.", result.Error);
    }

    [Fact]
    public async Task ValidateCreateMatch_ValidRequest_ReturnsOk()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db);
        var request = new CreateMatchDto(SportType.Fut5, DateTime.UtcNow.AddDays(1), "Field A", "1", 10, 90);

        var result = await svc.ValidateCreateMatchAsync(request);

        Assert.True(result.IsValid);
        Assert.Null(result.Error);
    }
}
