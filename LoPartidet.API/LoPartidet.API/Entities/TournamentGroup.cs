using LoPartidet.API.Models.Enums;

namespace LoPartidet.API.Entities
{
    public class TournamentGroup
    {
        public int Id { get; init; }
        public string Name { get; init; } = string.Empty;
        public int TournamentId { get; init; }
        public TournamentPhase Phase { get; init; }
        public int? BracketSlot { get; init; }

        public Tournament Tournament { get; init; } = null!;
        public ICollection<Team> Teams { get; set; } = [];
        public ICollection<TournamentMatch> Matches { get; set; } = [];
    }
}
