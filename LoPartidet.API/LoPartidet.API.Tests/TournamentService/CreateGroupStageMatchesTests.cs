using LoPartidet.API.Models;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LoPartidet.API.Tests.TournamentService;

public class CreateGroupStageMatchesTests : TournamentServiceTestBase
{
    private const int SlotCadenceMinutes = 20 * 2 + 5 + 20;

    [Fact]
    public async Task ReturnsRoundRobinPairsPerGroup()
    {
        using var db = CreateContext();
        await SeedAssignedGroupsAsync(db, groupsCount: 2, teamsPerGroup: 3, locationCount: 1);
        var svc = CreateService(db);

        var matches = await svc.CreateGroupStageMatches(1);

        Assert.Equal(6, matches.Count);
        Assert.Equal(3, matches.Count(m => m.GroupId == 1));
        Assert.Equal(3, matches.Count(m => m.GroupId == 2));
    }

    [Fact]
    public async Task PairsOnlyTeamsInSameGroup()
    {
        using var db = CreateContext();
        await SeedAssignedGroupsAsync(db, groupsCount: 2, teamsPerGroup: 3, locationCount: 1);
        var svc = CreateService(db);

        var matches = await svc.CreateGroupStageMatches(1);

        var teams = await db.Teams.ToDictionaryAsync(t => t.Id);
        foreach (var match in matches)
        {
            Assert.NotNull(match.TeamAId);
            Assert.NotNull(match.TeamBId);
            Assert.NotEqual(match.TeamAId, match.TeamBId);
            Assert.Equal(match.GroupId, teams[match.TeamAId!.Value].GroupId);
            Assert.Equal(match.GroupId, teams[match.TeamBId!.Value].GroupId);
        }
    }

    [Fact]
    public async Task SingleLocation_SchedulesSequentially()
    {
        using var db = CreateContext();
        var startDate = new DateTime(2030, 1, 1, 10, 0, 0, DateTimeKind.Utc);
        await SeedAssignedGroupsAsync(db, groupsCount: 2, teamsPerGroup: 3, locationCount: 1, startDate: startDate);
        var svc = CreateService(db);

        var matches = await svc.CreateGroupStageMatches(1);

        var ordered = matches.OrderBy(m => m.Date).ToList();
        for (var i = 0; i < ordered.Count; i++)
        {
            Assert.Equal(startDate.AddMinutes(i * SlotCadenceMinutes), ordered[i].Date);
            Assert.Equal(1, ordered[i].LocationId);
        }
    }

    [Fact]
    public async Task MultipleLocations_DistributesInParallelSlots()
    {
        using var db = CreateContext();
        var startDate = new DateTime(2030, 1, 1, 10, 0, 0, DateTimeKind.Utc);
        await SeedAssignedGroupsAsync(db, groupsCount: 2, teamsPerGroup: 3, locationCount: 2, startDate: startDate);
        var svc = CreateService(db);

        var matches = await svc.CreateGroupStageMatches(1);

        Assert.Equal(6, matches.Count);
        for (var slot = 0; slot < 3; slot++)
        {
            var expectedDate = startDate.AddMinutes(slot * SlotCadenceMinutes);
            var inSlot = matches.Where(m => m.Date == expectedDate).ToList();
            Assert.Equal(2, inSlot.Count);
            Assert.Contains(inSlot, m => m.LocationId == 1);
            Assert.Contains(inSlot, m => m.LocationId == 2);
        }
        Assert.Equal(3, matches.Count(m => m.LocationId == 1));
        Assert.Equal(3, matches.Count(m => m.LocationId == 2));
    }

    [Fact]
    public async Task SetsConstantMatchFields()
    {
        using var db = CreateContext();
        await SeedAssignedGroupsAsync(db, groupsCount: 2, teamsPerGroup: 3, locationCount: 1, createdById: 1);
        var svc = CreateService(db);

        var matches = await svc.CreateGroupStageMatches(1);

        foreach (var match in matches)
        {
            Assert.Equal(20, match.HalfDuration);
            Assert.Equal(5, match.HalfTimeDuration);
            Assert.Equal(MatchStatus.Scheduled, match.Status);
            Assert.Equal(1, match.CreatedById);
            Assert.Equal(1, match.TournamentId);
        }
    }

    [Fact]
    public async Task DoesNotPersistMatches()
    {
        using var db = CreateContext();
        await SeedAssignedGroupsAsync(db, groupsCount: 2, teamsPerGroup: 3, locationCount: 1);
        var svc = CreateService(db);

        var matches = await svc.CreateGroupStageMatches(1);

        Assert.NotEmpty(matches);
        Assert.Equal(0, await db.TournamentMatches.CountAsync());
    }
}
