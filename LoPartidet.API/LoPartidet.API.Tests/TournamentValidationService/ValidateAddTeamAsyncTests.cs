using LoPartidet.API.Entities;
using LoPartidet.API.Models.Enums;
using Xunit;

namespace LoPartidet.API.Tests.TournamentValidationService;

public class ValidateAddTeamAsyncTests : TournamentValidationServiceTestBase
{
    [Fact]
    public async Task ValidateAddTeam_EmptyName_ReturnsFail()
    {
        using var db = CreateContext();
        var svc = new API.Services.Validators.TournamentValidationService(db);
        var request = MakeAddTeamRequest(name: "   ");

        var result = await svc.ValidateAddTeamAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Name is required.", result.Error);
    }

    [Fact]
    public async Task ValidateAddTeam_InvalidUserId_ReturnsFail()
    {
        using var db = CreateContext();
        var svc = new API.Services.Validators.TournamentValidationService(db);
        var request = MakeAddTeamRequest(createdBy: "not-a-number");

        var result = await svc.ValidateAddTeamAsync(request);

        Assert.False(result.IsValid);
        Assert.Equal("Invalid user ID.", result.Error);
    }

    [Fact]
    public async Task ValidateAddTeam_UserNotFound_ReturnsFail()
    {
        using var db = CreateContext();
        var svc = new API.Services.Validators.TournamentValidationService(db);
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
        var svc = new API.Services.Validators.TournamentValidationService(db);
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
        var svc = new API.Services.Validators.TournamentValidationService(db);
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
        var svc = new API.Services.Validators.TournamentValidationService(db);
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
        var svc = new API.Services.Validators.TournamentValidationService(db);
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
        var svc = new API.Services.Validators.TournamentValidationService(db);
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
        var svc = new API.Services.Validators.TournamentValidationService(db);
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
        var svc = new API.Services.Validators.TournamentValidationService(db);
        var request = MakeAddTeamRequest();

        var result = await svc.ValidateAddTeamAsync(request);

        Assert.True(result.IsValid);
        Assert.Null(result.Error);
    }
}
