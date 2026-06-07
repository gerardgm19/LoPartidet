using LoPartidet.API.Models;

namespace LoPartidet.API.Services.Interfaces;

public interface ITournamentService
{
    Task<TournamentDto> CreateAsync(CreateTournamentDto request);
    Task<TeamDto> AddTeamAsync(int tournamentId, CreateTeamDto request);
    Task AssignTeamsToGroupsAsync(int tournamentId);
    Task StartTournamentAsync(int tournamentId);
    Task GetStandingsAsync(int tournamentId);
    Task GetBracketAsync(int tournamentId);
    Task GetByIdAsync(int id);
    Task GetAllAsync();
}
