using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Models.Enums;
using LoPartidet.API.Services.Validators.Interfaces;
using Xunit;

namespace LoPartidet.API.Tests.MatchValidationService;

public class ValidateJoinMatchAsyncTests : MatchValidationServiceTestBase
{
    [Fact]
    public async Task ValidateJoinMatch_InvalidUserId_ReturnsFail()
    {
        using var db = CreateContext();
        var svc = new API.Services.Validators.MatchValidationService(db);
        var request = new JoinMatchValidationRequest(1, "not-a-number");

        var result = await svc.ValidateJoinMatchAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Invalid user ID.", result.Error);
    }

    [Fact]
    public async Task ValidateJoinMatch_UserNotFound_ReturnsFail()
    {
        using var db = CreateContext();
        var svc = new API.Services.Validators.MatchValidationService(db);
        var request = new JoinMatchValidationRequest(1, "999");

        var result = await svc.ValidateJoinMatchAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("User not found.", result.Error);
    }

    [Fact]
    public async Task ValidateJoinMatch_MatchNotFound_ReturnsFail()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db);
        var request = new JoinMatchValidationRequest(999, "1");

        var result = await svc.ValidateJoinMatchAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Match not found.", result.Error);
    }

    [Fact]
    public async Task ValidateJoinMatch_MatchNotScheduled_ReturnsFail()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        db.Matches.Add(MakeMatch(1, 1, 10, MatchStatus.Finished));
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db);
        var request = new JoinMatchValidationRequest(1, "1");

        var result = await svc.ValidateJoinMatchAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Can only join scheduled matches.", result.Error);
    }

    [Fact]
    public async Task ValidateJoinMatch_UserAlreadyJoined_ReturnsFail()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        db.Matches.Add(MakeMatch(1, 1, 10, MatchStatus.Scheduled));
        await db.SaveChangesAsync();
        db.UserMatches.Add(new UserMatch { UserId = 1, MatchId = 1 });
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db);
        var request = new JoinMatchValidationRequest(1, "1");

        var result = await svc.ValidateJoinMatchAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("User already joined this match.", result.Error);
    }

    [Fact]
    public async Task ValidateJoinMatch_MatchFull_ReturnsFail()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        db.Users.Add(MakeUser(2));
        db.Users.Add(MakeUser(3));
        db.Matches.Add(MakeMatch(1, 1, 2, MatchStatus.Scheduled));
        await db.SaveChangesAsync();
        db.UserMatches.Add(new UserMatch { UserId = 1, MatchId = 1 });
        db.UserMatches.Add(new UserMatch { UserId = 2, MatchId = 1 });
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db);
        var request = new JoinMatchValidationRequest(1, "3");

        var result = await svc.ValidateJoinMatchAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Match is full.", result.Error);
    }

    [Fact]
    public async Task ValidateJoinMatch_ValidRequest_ReturnsOk()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        db.Matches.Add(MakeMatch(1, 1, 10, MatchStatus.Scheduled));
        await db.SaveChangesAsync();
        var svc = new API.Services.Validators.MatchValidationService(db);
        var request = new JoinMatchValidationRequest(1, "1");

        var result = await svc.ValidateJoinMatchAsync(request);

        Assert.True(result.IsValid);
        Assert.Null(result.Error);
    }
}
