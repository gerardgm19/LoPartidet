using LoPartidet.API.Models;

namespace LoPartidet.API.Services;

public class MatchesService : IMatchesService
{
    private static readonly List<Match> MockMatches =
    [
        new Match
        {
            Id = "1",
            FootballType = FootballType.Fut7,
            Date = new DateTime(2026, 4, 10, 20, 0, 0, DateTimeKind.Utc),
            Location = "Poliesportiu Les Corts, Barcelona",
            Organizer = "Marc Ribas",
            JoinedCount = 11,
            MaxPeople = 14,
            IsJoined = true,
            Status = MatchStatus.Scheduled,
        },
        new Match
        {
            Id = "2",
            FootballType = FootballType.Fut5,
            Date = new DateTime(2026, 4, 8, 19, 45, 0, DateTimeKind.Utc),
            Location = "Pista Municipal Nord, Madrid",
            Organizer = "Luis Herrera",
            JoinedCount = 10,
            MaxPeople = 10,
            IsJoined = true,
            Status = MatchStatus.Live,
        },
        new Match
        {
            Id = "3",
            FootballType = FootballType.Futsal,
            Date = new DateTime(2026, 4, 6, 17, 30, 0, DateTimeKind.Utc),
            Location = "Pavelló Can Zam, Santa Coloma",
            Organizer = "Jordi Puig",
            JoinedCount = 12,
            MaxPeople = 12,
            IsJoined = false,
            Status = MatchStatus.Finished,
        },
        new Match
        {
            Id = "4",
            FootballType = FootballType.Fut11,
            Date = new DateTime(2026, 4, 12, 11, 0, 0, DateTimeKind.Utc),
            Location = "Camp Municipal de Futbol, Badalona",
            Organizer = "Sergio Mora",
            JoinedCount = 14,
            MaxPeople = 22,
            IsJoined = false,
            Status = MatchStatus.Scheduled,
        },
        new Match
        {
            Id = "5",
            FootballType = FootballType.Beach,
            Date = new DateTime(2026, 4, 13, 10, 30, 0, DateTimeKind.Utc),
            Location = "Platja de la Barceloneta, Barcelona",
            Organizer = "Alex Font",
            JoinedCount = 8,
            MaxPeople = 10,
            IsJoined = true,
            Status = MatchStatus.Scheduled,
        },
    ];

    public IEnumerable<Match> GetAll() => MockMatches;

    public Match? GetById(string id) => MockMatches.FirstOrDefault(m => m.Id == id);
}
