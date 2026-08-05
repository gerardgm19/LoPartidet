using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Models.Enums;
using Xunit;

namespace LoPartidet.API.Tests.MatchValidationService;

public class ValidateUpdateMatchAsyncTests : MatchValidationServiceTestBase
{
    private static UpdateMatchValidationRequest MakeRequest(
        int matchId = 1,
        string identityId = "identity-1",
        bool isAdmin = true,
        DateTime? date = null,
        string location = "Field A",
        int maxPlayers = 10,
        int durationInMinutes = 90) =>
        new(matchId, identityId, isAdmin, date ?? DateTime.UtcNow.AddDays(1), location, maxPlayers, durationInMinutes);

    [Fact]
    public async Task ValidateUpdateMatch_MatchNotFound_ReturnsFail()
    {
        using var db = CreateContext();
        var svc = new API.Services.Validators.MatchValidationService(db);

        var result = await svc.ValidateUpdateMatchAsync(MakeRequest(matchId: 999));

        Assert.False(result.IsValid);
        Assert.Equal("Match not found.", result.Error);
    }

    [Fact]
    public async Task ValidateUpdateMatch_NotOwnerNotAdmin_ReturnsFail()
    {
        using var db = CreateContext();
        db.Matches.Add(MakeMatch(id: 1, createdById: 1));
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db);

        var result = await svc.ValidateUpdateMatchAsync(MakeRequest(isAdmin: false));

        Assert.False(result.IsValid);
        Assert.Equal("Only the match owner or an admin can edit this match.", result.Error);
    }

    [Fact]
    public async Task ValidateUpdateMatch_NotScheduled_ReturnsFail()
    {
        using var db = CreateContext();
        db.Matches.Add(MakeMatch(id: 1, status: MatchStatus.Finished));
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db);

        var result = await svc.ValidateUpdateMatchAsync(MakeRequest());

        Assert.False(result.IsValid);
        Assert.Equal("Only scheduled matches can be edited.", result.Error);
    }

    [Fact]
    public async Task ValidateUpdateMatch_MatchAlreadyStarted_ReturnsFail()
    {
        using var db = CreateContext();
        db.Matches.Add(MakeMatch(id: 1, date: DateTime.UtcNow.AddDays(-1)));
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db);

        var result = await svc.ValidateUpdateMatchAsync(MakeRequest());

        Assert.False(result.IsValid);
        Assert.Equal("Cannot edit a match that has already started.", result.Error);
    }

    [Fact]
    public async Task ValidateUpdateMatch_PastDate_ReturnsFail()
    {
        using var db = CreateContext();
        db.Matches.Add(MakeMatch(id: 1));
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db);

        var result = await svc.ValidateUpdateMatchAsync(MakeRequest(date: DateTime.UtcNow.AddDays(-1)));

        Assert.False(result.IsValid);
        Assert.Equal("Match date must be in the future.", result.Error);
    }

    [Fact]
    public async Task ValidateUpdateMatch_EmptyLocation_ReturnsFail()
    {
        using var db = CreateContext();
        db.Matches.Add(MakeMatch(id: 1));
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db);

        var result = await svc.ValidateUpdateMatchAsync(MakeRequest(location: "   "));

        Assert.False(result.IsValid);
        Assert.Equal("Location is required.", result.Error);
    }

    [Fact]
    public async Task ValidateUpdateMatch_MaxPlayersLessThanTwo_ReturnsFail()
    {
        using var db = CreateContext();
        db.Matches.Add(MakeMatch(id: 1));
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db);

        var result = await svc.ValidateUpdateMatchAsync(MakeRequest(maxPlayers: 1));

        Assert.False(result.IsValid);
        Assert.Equal("A match requires at least 2 players.", result.Error);
    }

    [Fact]
    public async Task ValidateUpdateMatch_MaxPlayersBelowJoinedCount_ReturnsFail()
    {
        using var db = CreateContext();
        db.Matches.Add(MakeMatch(id: 1, maxPlayers: 10));
        db.UserMatches.AddRange(
            new UserMatch { MatchId = 1, UserId = 1 },
            new UserMatch { MatchId = 1, UserId = 2 },
            new UserMatch { MatchId = 1, UserId = 3 });
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db);

        var result = await svc.ValidateUpdateMatchAsync(MakeRequest(maxPlayers: 2));

        Assert.False(result.IsValid);
        Assert.Equal("Max players cannot be lower than the number of joined players.", result.Error);
    }

    [Fact]
    public async Task ValidateUpdateMatch_DurationNotPositive_ReturnsFail()
    {
        using var db = CreateContext();
        db.Matches.Add(MakeMatch(id: 1));
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db);

        var result = await svc.ValidateUpdateMatchAsync(MakeRequest(durationInMinutes: 0));

        Assert.False(result.IsValid);
        Assert.Equal("Duration must be greater than 0.", result.Error);
    }

    [Fact]
    public async Task ValidateUpdateMatch_ValidRequest_ReturnsOk()
    {
        using var db = CreateContext();
        db.Matches.Add(MakeMatch(id: 1));
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db);

        var result = await svc.ValidateUpdateMatchAsync(MakeRequest());

        Assert.True(result.IsValid);
        Assert.Null(result.Error);
    }
}
