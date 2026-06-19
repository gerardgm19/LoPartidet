using LoPartidet.API.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LoPartidet.API.Tests.TournamentService;

public class StartTournamentAsyncTests : TournamentServiceTestBase
{
    [Fact]
    public async Task StartTournament_FlipsStatusToGroupStage()
    {
        using var db = CreateContext();
        await SeedReadyToStartAsync(db, groupsCount: 2, teamsPerGroup: 3, locationCount: 1);
        var svc = CreateService(db);

        await svc.StartTournamentAsync(1);

        var tournament = await db.Tournaments.FirstAsync(t => t.Id == 1);
        Assert.Equal(TournamentStatus.GroupStage, tournament.Status);
    }

    [Fact]
    public async Task StartTournament_PersistsGroupStageMatches()
    {
        using var db = CreateContext();
        await SeedReadyToStartAsync(db, groupsCount: 2, teamsPerGroup: 3, locationCount: 1);
        var svc = CreateService(db);

        await svc.StartTournamentAsync(1);

        var matchCount = await db.TournamentMatches.CountAsync(m => m.TournamentId == 1);
        Assert.Equal(6, matchCount);
    }

    [Fact]
    public async Task StartTournament_AssignsTeamsToGroups()
    {
        using var db = CreateContext();
        await SeedReadyToStartAsync(db, groupsCount: 2, teamsPerGroup: 3, locationCount: 1);
        var svc = CreateService(db);

        await svc.StartTournamentAsync(1);

        var teams = await db.Teams.Where(t => t.TournamentId == 1).ToListAsync();
        Assert.All(teams, t => Assert.NotNull(t.GroupId));
    }
}
