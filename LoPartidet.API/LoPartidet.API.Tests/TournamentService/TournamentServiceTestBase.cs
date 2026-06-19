using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Models.Enums;
using LoPartidet.API.Services.Validators;
using LoPartidet.API.Services.Validators.Interfaces;
using LoPartidet.API.Services.Validators.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging.Abstractions;

namespace LoPartidet.API.Tests.TournamentService;

public abstract class TournamentServiceTestBase
{
    protected static LoPartidetContext CreateContext()
    {
        var options = new DbContextOptionsBuilder<LoPartidetContext>()
            .UseInMemoryDatabase(Guid.NewGuid().ToString())
            .Options;
        return new LoPartidetContext(options);
    }

    protected static API.Services.TournamentService CreateService(LoPartidetContext db) =>
        new(db, new AlwaysValidValidationService(), NullLogger<API.Services.TournamentService>.Instance);

    protected static async Task SeedReadyToStartAsync(
        LoPartidetContext db,
        int tournamentId = 1,
        int createdById = 1,
        int groupsCount = 2,
        int teamsPerGroup = 3,
        int qualifiedPerGroup = 2,
        int locationCount = 1,
        DateTime? startDate = null)
    {
        db.Users.Add(new User
        {
            Id = createdById,
            Name = "Test",
            Surname = "User",
            Nickname = "tuser",
            Email = "test@test.com",
            City = "Barcelona",
        });
        db.Tournaments.Add(new Tournament
        {
            Id = tournamentId,
            Name = "Cup",
            SportType = SportType.Fut5,
            Status = TournamentStatus.Draft,
            CreatedById = createdById,
            StartDate = startDate ?? new DateTime(2030, 1, 1, 10, 0, 0, DateTimeKind.Utc),
            GroupsCount = groupsCount,
            TeamsPerGroup = teamsPerGroup,
            QualifiedPerGroup = qualifiedPerGroup,
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
        var teamCount = groupsCount * teamsPerGroup;
        for (var i = 0; i < teamCount; i++)
            db.Teams.Add(new Team
            {
                Id = i + 1,
                Name = $"T{i + 1}",
                TournamentId = tournamentId,
                CreatedById = createdById,
            });
        await db.SaveChangesAsync();
    }

    protected static async Task SeedAssignedGroupsAsync(
        LoPartidetContext db,
        int tournamentId = 1,
        int createdById = 1,
        int groupsCount = 2,
        int teamsPerGroup = 3,
        int locationCount = 1,
        DateTime? startDate = null)
    {
        db.Users.Add(new User
        {
            Id = createdById,
            Name = "Test",
            Surname = "User",
            Nickname = "tuser",
            Email = "test@test.com",
            City = "Barcelona",
        });
        db.Tournaments.Add(new Tournament
        {
            Id = tournamentId,
            Name = "Cup",
            SportType = SportType.Fut5,
            Status = TournamentStatus.Draft,
            CreatedById = createdById,
            StartDate = startDate ?? new DateTime(2030, 1, 1, 10, 0, 0, DateTimeKind.Utc),
            GroupsCount = groupsCount,
            TeamsPerGroup = teamsPerGroup,
            QualifiedPerGroup = 2,
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
        var teamId = 1;
        for (var g = 0; g < groupsCount; g++)
        {
            var groupId = g + 1;
            db.TournamentGroups.Add(new TournamentGroup
            {
                Id = groupId,
                Name = $"1.{groupId}",
                TournamentId = tournamentId,
                Phase = TournamentPhase.GroupStage,
            });
            for (var t = 0; t < teamsPerGroup; t++)
            {
                db.Teams.Add(new Team
                {
                    Id = teamId++,
                    Name = $"T{groupId}-{t + 1}",
                    TournamentId = tournamentId,
                    CreatedById = createdById,
                    GroupId = groupId,
                });
            }
        }
        await db.SaveChangesAsync();
    }

    private sealed class AlwaysValidValidationService : ITournamentValidationService
    {
        public Task<ValidationResult> ValidateCreateTournamentAsync(CreateTournamentDto request) =>
            Task.FromResult(ValidationResult.Ok());
        public Task<ValidationResult> ValidateAddTeamAsync(AddTeamValidationRequest request) =>
            Task.FromResult(ValidationResult.Ok());
        public Task<ValidationResult> ValidateAssignTeamsToGroupsAsync(AssignTeamsToGroupsValidationRequest request) =>
            Task.FromResult(ValidationResult.Ok());
        public Task<ValidationResult> ValidateAddLocationAsync(AddTournamentLocationValidationRequest request) =>
            Task.FromResult(ValidationResult.Ok());
        public Task<ValidationResult> ValidateStartTournamentAsync(StartTournamentValidationRequest request) =>
            Task.FromResult(ValidationResult.Ok());
    }
}
