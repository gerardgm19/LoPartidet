using LoPartidet.API.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LoPartidet.API.Tests.TournamentService;

public class GenerateTournamentDataTests : TournamentServiceTestBase
{
    [Fact]
    public async Task GenerateTournamentData_KeepsStatusDraft()
    {
        using var db = CreateContext();
        await SeedReadyToStartAsync(db, groupsCount: 2, teamsPerGroup: 3, locationCount: 1);
        var svc = CreateService(db);

        await svc.GenerateTournamentData(1);

        var tournament = await db.Tournaments.FirstAsync(t => t.Id == 1);
        Assert.Equal(TournamentStatus.Draft, tournament.Status);
    }

    [Fact]
    public async Task GenerateTournamentData_PersistsGroupStageAndBracketMatches()
    {
        using var db = CreateContext();
        await SeedReadyToStartAsync(db, groupsCount: 2, teamsPerGroup: 3, qualifiedPerGroup: 2, locationCount: 1);
        var svc = CreateService(db);

        await svc.GenerateTournamentData(1);

        // group stage = 2 groups * C(3,2)=3 → 6; bracket (size 4) = SF(2)+3P(1)+F(1) = 4; total 10
        var matchCount = await db.TournamentMatches.CountAsync(m => m.TournamentId == 1);
        Assert.Equal(10, matchCount);
    }

    [Fact]
    public async Task GenerateTournamentData_AssignsTeamsToGroups()
    {
        using var db = CreateContext();
        await SeedReadyToStartAsync(db, groupsCount: 2, teamsPerGroup: 3, locationCount: 1);
        var svc = CreateService(db);

        await svc.GenerateTournamentData(1);

        var teams = await db.Teams.Where(t => t.TournamentId == 1).ToListAsync();
        Assert.All(teams, t => Assert.NotNull(t.GroupId));
    }

    [Fact]
    public async Task GenerateTournamentData_ReturnsGeneratedGroupsAndMatches()
    {
        using var db = CreateContext();
        await SeedReadyToStartAsync(db, groupsCount: 2, teamsPerGroup: 3, qualifiedPerGroup: 2, locationCount: 1);
        var svc = CreateService(db);

        var data = await svc.GenerateTournamentData(1);

        Assert.Equal(2, data.Groups.Count);
        Assert.All(data.Groups, g => Assert.Equal(3, g.Teams.Count));
        Assert.Equal(6, data.GroupStageMatches.Count);
        Assert.Equal(4, data.BracketMatches.Count);
        // group stage matches carry real team ids/names; bracket templates do not yet
        Assert.All(data.GroupStageMatches, m => Assert.NotNull(m.TeamAName));
        Assert.All(data.BracketMatches, m => Assert.Null(m.TeamAId));
        Assert.All(data.GroupStageMatches, m => Assert.True(m.Id > 0));
    }
}
