using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Models.Enums;
using LoPartidet.API.Services.Validators.Models;
using Microsoft.EntityFrameworkCore;

namespace LoPartidet.API.Tests.TournamentValidationService;

public abstract class TournamentValidationServiceTestBase
{
    protected static LoPartidetContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<LoPartidetContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new LoPartidetContext(options);
    }

    protected static User MakeUser(int id = 1) => new()
    {
        Id = id,
        Name = "Test",
        Surname = "User",
        Nickname = "tuser",
        Email = "test@test.com",
        City = "Barcelona",
    };

    protected static Tournament MakeTournament(
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
        IsSingleElimination = true,
        HasThirdPlaceMatch = true,
    };

    protected static AddTeamValidationRequest MakeAddTeamRequest(
        int tournamentId = 1,
        string name = "Team A",
        string createdBy = "1",
        IReadOnlyList<int>? memberUserIds = null) =>
        new(tournamentId, name, createdBy, memberUserIds);

    protected static CreateTournamentDto MakeRequest(
        string name = "Cup",
        string createdBy = "1",
        DateTime? startDate = null,
        int groupsCount = 2,
        int teamsPerGroup = 4,
        int qualifiedPerGroup = 2,
        bool isSingleElimination = true,
        bool hasThirdPlaceMatch = true) =>
        new(name, SportType.Fut5, createdBy, startDate ?? DateTime.UtcNow.AddDays(7),
            groupsCount, teamsPerGroup, qualifiedPerGroup, isSingleElimination, hasThirdPlaceMatch);

    protected static async Task SeedStartTournamentAsync(
        LoPartidetContext db,
        int tournamentId = 1,
        int groupsCount = 2,
        int teamsPerGroup = 2,
        int qualifiedPerGroup = 2,
        TournamentStatus status = TournamentStatus.Draft,
        int locationCount = 1,
        int? teamCount = null)
    {
        db.Users.Add(MakeUser(1));
        db.Tournaments.Add(new Tournament
        {
            Id = tournamentId,
            Name = "Cup",
            SportType = SportType.Fut5,
            Status = status,
            CreatedById = 1,
            StartDate = DateTime.UtcNow.AddDays(7),
            GroupsCount = groupsCount,
            TeamsPerGroup = teamsPerGroup,
            QualifiedPerGroup = qualifiedPerGroup,
            IsSingleElimination = true,
            HasThirdPlaceMatch = true,
        });
        for (var i = 0; i < locationCount; i++)
        {
            db.Locations.Add(new Location { Id = i + 1, Name = $"Loc{i + 1}" });
            db.TournamentLocations.Add(new TournamentLocation
            {
                Id = i + 1,
                TournamentId = tournamentId,
                LocationId = i + 1,
            });
        }
        var teams = teamCount ?? groupsCount * teamsPerGroup;
        for (var i = 0; i < teams; i++)
            db.Teams.Add(new Team { Id = i + 1, Name = $"T{i + 1}", TournamentId = tournamentId, CreatedById = 1 });
        await db.SaveChangesAsync();
    }
}
