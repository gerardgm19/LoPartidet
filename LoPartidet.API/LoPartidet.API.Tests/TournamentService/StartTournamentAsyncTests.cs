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
    public async Task StartTournament_PersistsGroupStageAndBracketMatches()
    {
        using var db = CreateContext();
        await SeedReadyToStartAsync(db, groupsCount: 2, teamsPerGroup: 3, qualifiedPerGroup: 2, locationCount: 1);
        var svc = CreateService(db);

        await svc.StartTournamentAsync(1);

        // group stage = 2 groups * C(3,2)=3 → 6; bracket (size 4) = SF(2)+3P(1)+F(1) = 4; total 10
        var matchCount = await db.TournamentMatches.CountAsync(m => m.TournamentId == 1);
        Assert.Equal(10, matchCount);
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
