using LoPartidet.API.Data;
using LoPartidet.API.Services.Interfaces;

namespace LoPartidet.API.Services;

public class TournamentService(LoPartidetContext db) : ITournamentService
{
    public Task CreateAsync() => throw new NotImplementedException();

    public Task AddTeamAsync(int tournamentId, int teamId) => throw new NotImplementedException();

    public Task AssignTeamsToGroupsAsync(int tournamentId) => throw new NotImplementedException();

    public Task StartTournamentAsync(int tournamentId) => throw new NotImplementedException();

    public Task GetStandingsAsync(int tournamentId) => throw new NotImplementedException();

    public Task GetBracketAsync(int tournamentId) => throw new NotImplementedException();

    public Task GetByIdAsync(int id) => throw new NotImplementedException();

    public Task GetAllAsync() => throw new NotImplementedException();
}
