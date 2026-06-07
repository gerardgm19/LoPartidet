using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Models.Enums;
using LoPartidet.API.Services.Validators;
using LoPartidet.API.Services.Validators.Interfaces;
using LoPartidet.API.Services.Validators.Models;
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

    private static Tournament MakeTournament(
        int id = 1,
        int createdById = 1,
        int groupsCount = 2,
        int teamsPerGroup = 4,
        TournamentStatus status = TournamentStatus.Draft) => new()
    {
        Id = id,
        Name = "Cup",
        SportType = SportType.Fut5,
        Status = status,
        CreatedById = createdById,
        StartDate = DateTime.UtcNow.AddDays(7),
        GroupsCount = groupsCount,
        TeamsPerGroup = teamsPerGroup,
        QualifiedPerGroup = 2,
    };

    private static AddTeamValidationRequest MakeAddTeamRequest(
        int tournamentId = 1,
        string name = "Team A",
        string createdBy = "1",
        IReadOnlyList<int>? memberUserIds = null) =>
        new(tournamentId, name, createdBy, memberUserIds);

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

    // ValidateAddTeamAsync

    [Fact]
    public async Task ValidateAddTeam_EmptyName_ReturnsFail()
    {
        using var db = CreateContext();
        var svc = new TournamentValidationService(db);
        var request = MakeAddTeamRequest(name: "   ");

        var result = await svc.ValidateAddTeamAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Name is required.", result.Error);
    }

    [Fact]
    public async Task ValidateAddTeam_InvalidUserId_ReturnsFail()
    {
        using var db = CreateContext();
        var svc = new TournamentValidationService(db);
        var request = MakeAddTeamRequest(createdBy: "not-a-number");

        var result = await svc.ValidateAddTeamAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Invalid user ID.", result.Error);
    }

    [Fact]
    public async Task ValidateAddTeam_UserNotFound_ReturnsFail()
    {
        using var db = CreateContext();
        var svc = new TournamentValidationService(db);
        var request = MakeAddTeamRequest(createdBy: "999");

        var result = await svc.ValidateAddTeamAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("User not found.", result.Error);
    }

    [Fact]
    public async Task ValidateAddTeam_TournamentNotFound_ReturnsFail()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        await db.SaveChangesAsync();
        var svc = new TournamentValidationService(db);
        var request = MakeAddTeamRequest(tournamentId: 999);

        var result = await svc.ValidateAddTeamAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Tournament not found.", result.Error);
    }

    [Fact]
    public async Task ValidateAddTeam_TournamentNotDraft_ReturnsFail()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        db.Tournaments.Add(MakeTournament(status: TournamentStatus.GroupStage));
        await db.SaveChangesAsync();
        var svc = new TournamentValidationService(db);
        var request = MakeAddTeamRequest();

        var result = await svc.ValidateAddTeamAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Teams can only be added while tournament is in Draft.", result.Error);
    }

    [Fact]
    public async Task ValidateAddTeam_TournamentFull_ReturnsFail()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        db.Tournaments.Add(MakeTournament(id: 1, groupsCount: 1, teamsPerGroup: 2));
        db.Teams.Add(new Team { Id = 1, Name = "T1", TournamentId = 1, CreatedById = 1 });
        db.Teams.Add(new Team { Id = 2, Name = "T2", TournamentId = 1, CreatedById = 1 });
        await db.SaveChangesAsync();
        var svc = new TournamentValidationService(db);
        var request = MakeAddTeamRequest(name: "T3");

        var result = await svc.ValidateAddTeamAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Tournament is full.", result.Error);
    }

    [Fact]
    public async Task ValidateAddTeam_DuplicateName_ReturnsFail()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        db.Tournaments.Add(MakeTournament(id: 1));
        db.Teams.Add(new Team { Id = 1, Name = "Team A", TournamentId = 1, CreatedById = 1 });
        await db.SaveChangesAsync();
        var svc = new TournamentValidationService(db);
        var request = MakeAddTeamRequest(name: "Team A");

        var result = await svc.ValidateAddTeamAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Team name already used in this tournament.", result.Error);
    }

    [Fact]
    public async Task ValidateAddTeam_MemberNotFound_ReturnsFail()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        db.Users.Add(MakeUser(2));
        db.Tournaments.Add(MakeTournament(id: 1));
        await db.SaveChangesAsync();
        var svc = new TournamentValidationService(db);
        var request = MakeAddTeamRequest(memberUserIds: new[] { 2, 999 });

        var result = await svc.ValidateAddTeamAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("One or more team members do not exist.", result.Error);
    }

    [Fact]
    public async Task ValidateAddTeam_ValidWithMembers_ReturnsOk()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        db.Users.Add(MakeUser(2));
        db.Users.Add(MakeUser(3));
        db.Tournaments.Add(MakeTournament(id: 1));
        await db.SaveChangesAsync();
        var svc = new TournamentValidationService(db);
        var request = MakeAddTeamRequest(memberUserIds: new[] { 2, 3 });

        var result = await svc.ValidateAddTeamAsync(request);

        Assert.True(result.IsValid);
        Assert.Null(result.Error);
    }

    [Fact]
    public async Task ValidateAddTeam_ValidRequest_ReturnsOk()
    {
        using var db = CreateContext();
        db.Users.Add(MakeUser(1));
        db.Tournaments.Add(MakeTournament(id: 1));
        await db.SaveChangesAsync();
        var svc = new TournamentValidationService(db);
        var request = MakeAddTeamRequest();

        var result = await svc.ValidateAddTeamAsync(request);

        Assert.True(result.IsValid);
        Assert.Null(result.Error);
    }
}
