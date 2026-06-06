using LoPartidet.API.Models;

namespace LoPartidet.API.Services.Interfaces;

public interface ITournamentService
{
    Task<TournamentDto> CreateAsync(CreateTournamentDto request);
    Task AddTeamAsync(int tournamentId, int teamId);
    Task AssignTeamsToGroupsAsync(int tournamentId);
    Task StartTournamentAsync(int tournamentId);
    Task GetStandingsAsync(int tournamentId);
    Task GetBracketAsync(int tournamentId);
    Task GetByIdAsync(int id);
    Task GetAllAsync();
}
