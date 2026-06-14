using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Models.Enums;
using Microsoft.EntityFrameworkCore;

namespace LoPartidet.API.Tests.MatchValidationService;

public abstract class MatchValidationServiceTestBase
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

    protected static Match MakeMatch(
        int id = 1,
        int createdById = 1,
        int maxPlayers = 10,
        MatchStatus status = MatchStatus.Scheduled) => new()
    {
        Id = id,
        CreatedById = createdById,
        Date = DateTime.UtcNow.AddDays(1),
        LocationId = 1,
        Type = SportType.Fut5,
        MaxPlayers = maxPlayers,
        Status = status,
        CreatedAt = DateTime.UtcNow,
    };
}
