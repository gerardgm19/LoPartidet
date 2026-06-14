using LoPartidet.API.Services.Validators.Models;
using Xunit;

namespace LoPartidet.API.Tests.TournamentValidationService;

public class ValidateStartTournamentAsyncTests : TournamentValidationServiceTestBase
{
    [Fact]
    public async Task ValidateStartTournament_NotFound_ReturnsFail()
    {
        using var db = CreateContext();
        var svc = new API.Services.Validators.TournamentValidationService(db);

        var result = await svc.ValidateStartTournamentAsync(new StartTournamentValidationRequest(999));

        Assert.False(result.IsValid);
        Assert.Equal("Tournament not found.", result.Error);
    }

    [Fact]
    public async Task ValidateStartTournament_NotDraft_ReturnsFail()
    {
        using var db = CreateContext();
        await SeedStartTournamentAsync(db, status: API.Models.Enums.TournamentStatus.GroupStage);
        var svc = new API.Services.Validators.TournamentValidationService(db);

        var result = await svc.ValidateStartTournamentAsync(new StartTournamentValidationRequest(1));

        Assert.False(result.IsValid);
        Assert.Equal("Only Draft tournaments can be started.", result.Error);
    }

    [Fact]
    public async Task ValidateStartTournament_NoLocations_ReturnsFail()
    {
        using var db = CreateContext();
        await SeedStartTournamentAsync(db, locationCount: 0);
        var svc = new API.Services.Validators.TournamentValidationService(db);

        var result = await svc.ValidateStartTournamentAsync(new StartTournamentValidationRequest(1));

        Assert.False(result.IsValid);
        Assert.Equal("Tournament must have at least one location assigned.", result.Error);
    }

    [Fact]
    public async Task ValidateStartTournament_TeamCountMismatch_ReturnsFail()
    {
        using var db = CreateContext();
        await SeedStartTournamentAsync(db, groupsCount: 2, teamsPerGroup: 2, teamCount: 3);
        var svc = new API.Services.Validators.TournamentValidationService(db);

        var result = await svc.ValidateStartTournamentAsync(new StartTournamentValidationRequest(1));

        Assert.False(result.IsValid);
        Assert.Equal("Tournament team count does not match expected capacity.", result.Error);
    }

    [Theory]
    [InlineData(3, 1)]
    [InlineData(5, 1)]
    [InlineData(3, 2)]
    public async Task ValidateStartTournament_InvalidBracketSize_ReturnsFail(int groupsCount, int qualifiedPerGroup)
    {
        using var db = CreateContext();
        await SeedStartTournamentAsync(db, groupsCount: groupsCount, teamsPerGroup: 2, qualifiedPerGroup: qualifiedPerGroup);
        var svc = new API.Services.Validators.TournamentValidationService(db);

        var result = await svc.ValidateStartTournamentAsync(new StartTournamentValidationRequest(1));

        Assert.False(result.IsValid);
        Assert.Equal("Groups count multiplied by qualified per group must equal 2, 4, 8, or 16.", result.Error);
    }

    [Theory]
    [InlineData(2, 1)]
    [InlineData(2, 2)]
    [InlineData(4, 2)]
    [InlineData(8, 2)]
    public async Task ValidateStartTournament_ValidRequest_ReturnsOk(int groupsCount, int qualifiedPerGroup)
    {
        using var db = CreateContext();
        await SeedStartTournamentAsync(db, groupsCount: groupsCount, teamsPerGroup: 2, qualifiedPerGroup: qualifiedPerGroup);
        var svc = new API.Services.Validators.TournamentValidationService(db);

        var result = await svc.ValidateStartTournamentAsync(new StartTournamentValidationRequest(1));

        Assert.True(result.IsValid);
        Assert.Null(result.Error);
    }
}
