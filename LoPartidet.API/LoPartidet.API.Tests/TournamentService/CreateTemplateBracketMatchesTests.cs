using LoPartidet.API.Models;
using LoPartidet.API.Models.Enums;
using Microsoft.EntityFrameworkCore;
using Xunit;

namespace LoPartidet.API.Tests.TournamentService;

public class CreateTemplateBracketMatchesTests : TournamentServiceTestBase
{
    private const int SlotCadenceMinutes = 20 * 2 + 5 + 20;
    private static readonly DateTime StartDate = new(2030, 1, 1, 10, 0, 0, DateTimeKind.Utc);

    [Fact]
    public async Task BracketSize2_CreatesOnlyFinal()
    {
        using var db = CreateContext();
        await SeedReadyToStartAsync(db, groupsCount: 1, teamsPerGroup: 2, qualifiedPerGroup: 2,
            locationCount: 1, startDate: StartDate, hasThirdPlaceMatch: true);
        var svc = CreateService(db);
        await svc.StartTournamentAsync(1);

        var matches = await svc.CreateTemplateBracketMatches(1);

        Assert.Single(matches);
        var groups = await db.TournamentGroups.Where(g => g.Phase != TournamentPhase.GroupStage).ToListAsync();
        Assert.Single(groups);
        Assert.Equal(TournamentPhase.Final, groups[0].Phase);
        Assert.Equal($"{Enum.GetName(TournamentPhase.Final)}1", groups[0].Name);
        Assert.Equal(1, groups[0].BracketSlot);
        // 1 group * C(2,2)=1 group match @ slot 0 → bracketsStartDate = slot 1; currentSlot = 1 → Final @ slot 2
        Assert.Equal(StartDate.AddMinutes(2 * SlotCadenceMinutes), matches[0].Date);
    }

    [Fact]
    public async Task BracketSize4_WithThirdPlace_CreatesSemisThirdAndFinal()
    {
        using var db = CreateContext();
        await SeedReadyToStartAsync(db, groupsCount: 2, teamsPerGroup: 2, qualifiedPerGroup: 2,
            locationCount: 1, startDate: StartDate, hasThirdPlaceMatch: true);
        var svc = CreateService(db);
        await svc.StartTournamentAsync(1);

        var matches = await svc.CreateTemplateBracketMatches(1);

        Assert.Equal(4, matches.Count);
        var groups = await db.TournamentGroups.Where(g => g.Phase != TournamentPhase.GroupStage).ToListAsync();
        Assert.Equal(2, groups.Count(g => g.Phase == TournamentPhase.SemiFinal));
        Assert.Equal(1, groups.Count(g => g.Phase == TournamentPhase.ThirdPlace));
        Assert.Equal(1, groups.Count(g => g.Phase == TournamentPhase.Final));
    }

    [Fact]
    public async Task BracketSize4_WithoutThirdPlace_SkipsThirdPlaceGroup()
    {
        using var db = CreateContext();
        await SeedReadyToStartAsync(db, groupsCount: 2, teamsPerGroup: 2, qualifiedPerGroup: 2,
            locationCount: 1, startDate: StartDate, hasThirdPlaceMatch: false);
        var svc = CreateService(db);
        await svc.StartTournamentAsync(1);

        var matches = await svc.CreateTemplateBracketMatches(1);

        Assert.Equal(3, matches.Count);
        var groups = await db.TournamentGroups.Where(g => g.Phase != TournamentPhase.GroupStage).ToListAsync();
        Assert.DoesNotContain(groups, g => g.Phase == TournamentPhase.ThirdPlace);
        Assert.Equal(2, groups.Count(g => g.Phase == TournamentPhase.SemiFinal));
        Assert.Equal(1, groups.Count(g => g.Phase == TournamentPhase.Final));
    }

    [Fact]
    public async Task BracketSize8_CreatesQuarterSemiThirdFinal()
    {
        using var db = CreateContext();
        await SeedReadyToStartAsync(db, groupsCount: 4, teamsPerGroup: 2, qualifiedPerGroup: 2,
            locationCount: 1, startDate: StartDate, hasThirdPlaceMatch: true);
        var svc = CreateService(db);
        await svc.StartTournamentAsync(1);

        var matches = await svc.CreateTemplateBracketMatches(1);

        Assert.Equal(8, matches.Count);
        var groups = await db.TournamentGroups.Where(g => g.Phase != TournamentPhase.GroupStage).ToListAsync();
        Assert.Equal(4, groups.Count(g => g.Phase == TournamentPhase.QuarterFinal));
        Assert.Equal(2, groups.Count(g => g.Phase == TournamentPhase.SemiFinal));
        Assert.Equal(1, groups.Count(g => g.Phase == TournamentPhase.ThirdPlace));
        Assert.Equal(1, groups.Count(g => g.Phase == TournamentPhase.Final));
    }

    [Fact]
    public async Task AllMatchesHaveNullTeams()
    {
        using var db = CreateContext();
        await SeedReadyToStartAsync(db, groupsCount: 4, teamsPerGroup: 2, qualifiedPerGroup: 2,
            locationCount: 1, startDate: StartDate);
        var svc = CreateService(db);
        await svc.StartTournamentAsync(1);

        var matches = await svc.CreateTemplateBracketMatches(1);

        Assert.All(matches, m =>
        {
            Assert.Null(m.TeamAId);
            Assert.Null(m.TeamBId);
        });
    }

    [Fact]
    public async Task SetsConstantMatchFields()
    {
        using var db = CreateContext();
        await SeedReadyToStartAsync(db, groupsCount: 2, teamsPerGroup: 2, qualifiedPerGroup: 2,
            locationCount: 1, startDate: StartDate, createdById: 1);
        var svc = CreateService(db);
        await svc.StartTournamentAsync(1);

        var matches = await svc.CreateTemplateBracketMatches(1);

        Assert.All(matches, m =>
        {
            Assert.Equal(20, m.HalfDuration);
            Assert.Equal(5, m.HalfTimeDuration);
            Assert.Equal(MatchStatus.Scheduled, m.Status);
            Assert.Equal(1, m.CreatedById);
            Assert.Equal(1, m.TournamentId);
            Assert.NotNull(m.GroupId);
        });
    }

    [Fact]
    public async Task BracketSlotsNumberedSequentiallyWithinPhase()
    {
        using var db = CreateContext();
        await SeedReadyToStartAsync(db, groupsCount: 4, teamsPerGroup: 2, qualifiedPerGroup: 2,
            locationCount: 1, startDate: StartDate, hasThirdPlaceMatch: true);
        var svc = CreateService(db);
        await svc.StartTournamentAsync(1);

        await svc.CreateTemplateBracketMatches(1);

        var groups = await db.TournamentGroups
            .Where(g => g.Phase != TournamentPhase.GroupStage)
            .ToListAsync();

        var qf = groups.Where(g => g.Phase == TournamentPhase.QuarterFinal)
            .OrderBy(g => g.BracketSlot).Select(g => g.BracketSlot).ToList();
        Assert.Equal(new int?[] { 1, 2, 3, 4 }, qf);

        var sf = groups.Where(g => g.Phase == TournamentPhase.SemiFinal)
            .OrderBy(g => g.BracketSlot).Select(g => g.BracketSlot).ToList();
        Assert.Equal(new int?[] { 1, 2 }, sf);

        Assert.Equal(1, groups.Single(g => g.Phase == TournamentPhase.ThirdPlace).BracketSlot);
        Assert.Equal(1, groups.Single(g => g.Phase == TournamentPhase.Final).BracketSlot);
    }

    [Fact]
    public async Task SingleLocation_SchedulesAfterGroupStageSequentially()
    {
        using var db = CreateContext();
        await SeedReadyToStartAsync(db, groupsCount: 2, teamsPerGroup: 2, qualifiedPerGroup: 2,
            locationCount: 1, startDate: StartDate, hasThirdPlaceMatch: true);
        var svc = CreateService(db);
        await svc.StartTournamentAsync(1);

        var matches = await svc.CreateTemplateBracketMatches(1);

        // group matches = 2 groups * C(2,2)=1 → 2 group slots used; bracketsStartDate = lastGroup + 1 slot = slot 2
        // currentSlot = 2 → SF1@4, SF2@5, 3P@6, F@7
        var ordered = matches.OrderBy(m => m.Date).ToList();
        for (var i = 0; i < ordered.Count; i++)
            Assert.Equal(StartDate.AddMinutes((4 + i) * SlotCadenceMinutes), ordered[i].Date);
        Assert.All(matches, m => Assert.Equal(1, m.TournamentLocationId));
    }

    [Fact]
    public async Task MultiLocation_ParallelWithinRoundSequentialBetweenRounds()
    {
        using var db = CreateContext();
        await SeedReadyToStartAsync(db, groupsCount: 4, teamsPerGroup: 2, qualifiedPerGroup: 2,
            locationCount: 2, startDate: StartDate, hasThirdPlaceMatch: true);
        var svc = CreateService(db);
        await svc.StartTournamentAsync(1);

        var matches = await svc.CreateTemplateBracketMatches(1);
        var bracketGroups = await db.TournamentGroups
            .Where(g => g.Phase != TournamentPhase.GroupStage)
            .ToDictionaryAsync(g => g.Id);

        // group matches = 4 groups * C(2,2)=1 → 4 group matches → ceil(4/2)=2 slots used (last @ slot 1)
        // bracketsStartDate = lastGroup + 1 slot = slot 2; currentSlot = 2
        // QF (4 matches, 2 loc): 2 at slot 4, 2 at slot 5
        // SF (2 matches, 2 loc): 2 at slot 6
        // 3P (1 match): slot 7
        // F (1 match):  slot 8
        DateTime Slot(int s) => StartDate.AddMinutes(s * SlotCadenceMinutes);

        var qfDates = matches.Where(m => bracketGroups[m.GroupId!.Value].Phase == TournamentPhase.QuarterFinal)
            .Select(m => m.Date).OrderBy(d => d).ToList();
        Assert.Equal(new[] { Slot(4), Slot(4), Slot(5), Slot(5) }, qfDates);

        var sfDates = matches.Where(m => bracketGroups[m.GroupId!.Value].Phase == TournamentPhase.SemiFinal)
            .Select(m => m.Date).OrderBy(d => d).ToList();
        Assert.Equal(new[] { Slot(6), Slot(6) }, sfDates);

        var third = matches.Single(m => bracketGroups[m.GroupId!.Value].Phase == TournamentPhase.ThirdPlace);
        Assert.Equal(Slot(7), third.Date);

        var final = matches.Single(m => bracketGroups[m.GroupId!.Value].Phase == TournamentPhase.Final);
        Assert.Equal(Slot(8), final.Date);
    }

    [Fact]
    public async Task PersistsGroupsButDoesNotPersistMatches()
    {
        using var db = CreateContext();
        await SeedReadyToStartAsync(db, groupsCount: 2, teamsPerGroup: 2, qualifiedPerGroup: 2,
            locationCount: 1, startDate: StartDate);
        var svc = CreateService(db);
        await svc.StartTournamentAsync(1);
        var groupStageMatchCount = await db.TournamentMatches.CountAsync();

        var matches = await svc.CreateTemplateBracketMatches(1);

        Assert.NotEmpty(matches);
        Assert.Equal(groupStageMatchCount, await db.TournamentMatches.CountAsync());
        Assert.True(await db.TournamentGroups.AnyAsync(g => g.Phase != TournamentPhase.GroupStage));
    }
}
