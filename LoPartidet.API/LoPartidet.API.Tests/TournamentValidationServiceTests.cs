using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Models.Enums;
using LoPartidet.API.Services.Validators;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LoPartidet.API.Tests;

public class TournamentValidationServiceTests
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

    private static CreateTournamentDto MakeRequest(
        string name = "Cup",
        string createdBy = "1",
        DateTime? startDate = null,
        int groupsCount = 2,
        int teamsPerGroup = 4,
        int qualifiedPerGroup = 2) =>
        new(name, SportType.Fut5, createdBy, startDate ?? DateTime.UtcNow.AddDays(7),
            groupsCount, teamsPerGroup, qualifiedPerGroup);

    [Fact]
    public async Task ValidateCreateTournament_EmptyName_ReturnsFail()
    {
        using var db = CreateContext();
        var svc = new TournamentValidationService(db);
        var request = MakeRequest(name: "   ");

        var result = await svc.ValidateCreateTournamentAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Name is required.", result.Error);
    }

    [Fact]
    public async Task ValidateCreateTournament_InvalidUserId_ReturnsFail()
    {
        using var db = CreateContext();
        var svc = new TournamentValidationService(db);
        var request = MakeRequest(createdBy: "not-a-number");

        var result = await svc.ValidateCreateTournamentAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Invalid user ID.", result.Error);
    }

    [Fact]
    public async Task ValidateCreateTournament_UserNotFound_ReturnsFail()
    {
        using var db = CreateContext();
        var svc = new TournamentValidationService(db);
        var request = MakeRequest(createdBy: "999");

        var result = await svc.ValidateCreateTournamentAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("User not found.", result.Error);
    }

    [Fact]
    public async Task ValidateCreateTournament_PastStartDate_ReturnsFail()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        await db.SaveChangesAsync();
        var svc = new TournamentValidationService(db);
        var request = MakeRequest(startDate: DateTime.UtcNow.AddDays(-1));

        var result = await svc.ValidateCreateTournamentAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Tournament start date must be in the future.", result.Error);
    }

    [Fact]
    public async Task ValidateCreateTournament_GroupsCountZero_ReturnsFail()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        await db.SaveChangesAsync();
        var svc = new TournamentValidationService(db);
        var request = MakeRequest(groupsCount: 0);

        var result = await svc.ValidateCreateTournamentAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Groups count must be at least 1.", result.Error);
    }

    [Fact]
    public async Task ValidateCreateTournament_TeamsPerGroupLessThanTwo_ReturnsFail()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        await db.SaveChangesAsync();
        var svc = new TournamentValidationService(db);
        var request = MakeRequest(teamsPerGroup: 1);

        var result = await svc.ValidateCreateTournamentAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Teams per group must be at least 2.", result.Error);
    }

    [Fact]
    public async Task ValidateCreateTournament_QualifiedPerGroupZero_ReturnsFail()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        await db.SaveChangesAsync();
        var svc = new TournamentValidationService(db);
        var request = MakeRequest(qualifiedPerGroup: 0);

        var result = await svc.ValidateCreateTournamentAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Qualified per group must be at least 1.", result.Error);
    }

    [Fact]
    public async Task ValidateCreateTournament_QualifiedExceedsTeamsPerGroup_ReturnsFail()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        await db.SaveChangesAsync();
        var svc = new TournamentValidationService(db);
        var request = MakeRequest(teamsPerGroup: 4, qualifiedPerGroup: 5);

        var result = await svc.ValidateCreateTournamentAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Qualified per group cannot exceed teams per group.", result.Error);
    }

    [Fact]
    public async Task ValidateCreateTournament_ValidRequest_ReturnsOk()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        await db.SaveChangesAsync();
        var svc = new TournamentValidationService(db);
        var request = MakeRequest();

        var result = await svc.ValidateCreateTournamentAsync(request);

        Assert.True(result.IsValid);
        Assert.Null(result.Error);
    }
}
