using LoPartidet.API.Models;
using Xunit;

namespace LoPartidet.API.Tests.MatchValidationService;

public class ValidateCanEditMatchAsyncTests : MatchValidationServiceTestBase
{
    [Fact]
    public async Task CanEdit_ScheduledFutureMatchOutsideWindow_ReturnsOk()
    {
        using var db = CreateContext();
        db.Matches.Add(MakeMatch(id: 1, date: DateTime.UtcNow.AddDays(5)));
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db, MakeConfig(2));

        var result = await svc.ValidateCanEditMatchAsync(1, "identity-1", isAdmin: true);

        Assert.True(result.IsValid);
    }

    [Fact]
    public async Task CanEdit_MatchWithinBlockWindow_ReturnsFail()
    {
        using var db = CreateContext();
        db.Matches.Add(MakeMatch(id: 1, date: DateTime.UtcNow.AddDays(1)));
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db, MakeConfig(2));

        var result = await svc.ValidateCanEditMatchAsync(1, "identity-1", isAdmin: true);

        Assert.False(result.IsValid);
        Assert.Equal("Matches cannot be edited within 2 days of their start.", result.Error);
    }

    [Fact]
    public async Task CanEdit_NotOwnerNotAdmin_ReturnsFail()
    {
        using var db = CreateContext();
        db.Matches.Add(MakeMatch(id: 1, createdById: 1, date: DateTime.UtcNow.AddDays(5)));
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db, MakeConfig(2));

        var result = await svc.ValidateCanEditMatchAsync(1, "identity-x", isAdmin: false);

        Assert.False(result.IsValid);
        Assert.Equal("Only the match owner or an admin can edit this match.", result.Error);
    }

    [Fact]
    public async Task CanEdit_NotScheduled_ReturnsFail()
    {
        using var db = CreateContext();
        db.Matches.Add(MakeMatch(id: 1, status: MatchStatus.Finished, date: DateTime.UtcNow.AddDays(5)));
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db, MakeConfig(2));

        var result = await svc.ValidateCanEditMatchAsync(1, "identity-1", isAdmin: true);

        Assert.False(result.IsValid);
        Assert.Equal("Only scheduled matches can be edited.", result.Error);
    }

    [Fact]
    public async Task CanEdit_MatchNotFound_ReturnsFail()
    {
        using var db = CreateContext();
        var svc = new API.Services.Validators.MatchValidationService(db, MakeConfig(2));

        var result = await svc.ValidateCanEditMatchAsync(999, "identity-1", isAdmin: true);

        Assert.False(result.IsValid);
        Assert.Equal("Match not found.", result.Error);
    }
}
