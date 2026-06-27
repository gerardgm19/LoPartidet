using LoPartidet.API.Models;

namespace LoPartidet.API.Services.Interfaces;

public interface ITournamentService
{
    Task<TournamentDto> CreateAsync(CreateTournamentDto request);
    Task<TeamDto> AddTeamAsync(int tournamentId, CreateTeamDto request);
    Task<IReadOnlyList<GroupDto>> AssignTeamsToGroupsAsync(int tournamentId);
    Task<TournamentLocationDto> AddLocationAsync(int tournamentId, AddTournamentLocationDto request);
    Task StartTournamentAsync(int tournamentId);
    Task GetStandingsAsync(int tournamentId);
    Task GetBracketAsync(int tournamentId);
    Task<TournamentDetailDto?> GetByIdAsync(int id, string identityId);
    Task<IReadOnlyList<TeamDto>> GetTeamsByTournamentAsync(int tournamentId, string identityId);
    Task<IReadOnlyList<TournamentDto>> GetAllAsync();
}
