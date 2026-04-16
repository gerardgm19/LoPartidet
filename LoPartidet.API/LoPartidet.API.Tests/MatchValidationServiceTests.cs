using LoPartidet.API.Data;
using Xunit;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Services.Validators;
using Microsoft.EntityFrameworkCore;

namespace LoPartidet.API.Tests;

public class MatchValidationServiceTests
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

    private static Match MakeMatch(
        int id = 1,
        int createdById = 1,
        int maxPlayers = 10,
        MatchStatus status = MatchStatus.Scheduled) => new()
    {
        Id = id,
        CreatedById = createdById,
        Date = DateTime.UtcNow.AddDays(1),
        Location = "Field A",
        Type = SportType.Fut5,
        MaxPlayers = maxPlayers,
        Status = status,
        CreatedAt = DateTime.UtcNow,
    };

    // ValidateCreateMatchAsync

    [Fact]
    public async Task ValidateCreateMatch_UserNotFound_ReturnsFail()
    {
        using var db = CreateContext();
        var svc = new MatchValidationService(db);
        var request = new CreateMatchDto(SportType.Fut5, DateTime.UtcNow.AddDays(1), "Field A", "999", 10);

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
        var svc = new MatchValidationService(db);
        var request = new CreateMatchDto(SportType.Fut5, DateTime.UtcNow.AddDays(-1), "Field A", "1", 10);

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
        var svc = new MatchValidationService(db);
        var request = new CreateMatchDto(SportType.Fut5, DateTime.UtcNow.AddDays(1), "   ", "1", 10);

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
        var svc = new MatchValidationService(db);
        var request = new CreateMatchDto(SportType.Fut5, DateTime.UtcNow.AddDays(1), "Field A", "1", 1);

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
        var svc = new MatchValidationService(db);
        var request = new CreateMatchDto(SportType.Fut5, DateTime.UtcNow.AddDays(1), "Field A", "1", 10);

        var result = await svc.ValidateCreateMatchAsync(request);

        Assert.True(result.IsValid);
        Assert.Null(result.Error);
    }

    // ValidateJoinMatchAsync

    [Fact]
    public async Task ValidateJoinMatch_InvalidUserId_ReturnsFail()
    {
        using var db = CreateContext();
        var svc = new MatchValidationService(db);
        var request = new JoinMatchValidationRequest(1, "not-a-number");

        var result = await svc.ValidateJoinMatchAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Invalid user ID.", result.Error);
    }

    [Fact]
    public async Task ValidateJoinMatch_UserNotFound_ReturnsFail()
    {
        using var db = CreateContext();
        var svc = new MatchValidationService(db);
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
        var svc = new MatchValidationService(db);
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
        var svc = new MatchValidationService(db);
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
        var svc = new MatchValidationService(db);
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
        var svc = new MatchValidationService(db);
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
        var svc = new MatchValidationService(db);
        var request = new JoinMatchValidationRequest(1, "1");

        var result = await svc.ValidateJoinMatchAsync(request);

        Assert.True(result.IsValid);
        Assert.Null(result.Error);
    }
}
