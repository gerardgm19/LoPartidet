using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Models.Enums;
using LoPartidet.API.Services.Interfaces;
using LoPartidet.API.Services.Validators;

namespace LoPartidet.API.Services;

public class TournamentService(LoPartidetContext db, ITournamentValidationService validationService) : ITournamentService
{
    public async Task<TournamentDto> CreateAsync(CreateTournamentDto request)
    {
        var validation = await validationService.ValidateCreateTournamentAsync(request);
        if (!validation.IsValid)
            throw new InvalidOperationException(validation.Error);

        var tournament = new Tournament
        {
            Name = request.Name,
            SportType = request.SportType,
            Status = TournamentStatus.Draft,
            CreatedById = int.Parse(request.CreatedBy),
            StartDate = request.StartDate,
            GroupsCount = request.GroupsCount,
            TeamsPerGroup = request.TeamsPerGroup,
            QualifiedPerGroup = request.QualifiedPerGroup,
        };

        db.Tournaments.Add(tournament);
        await db.SaveChangesAsync();

        return new TournamentDto(
            tournament.Id,
            tournament.Name,
            tournament.SportType,
            tournament.Status,
            tournament.CreatedById,
            tournament.StartDate,
            tournament.GroupsCount,
            tournament.TeamsPerGroup,
            tournament.QualifiedPerGroup);
    }

    public Task AddTeamAsync(int tournamentId, int teamId) => throw new NotImplementedException();

    public Task AssignTeamsToGroupsAsync(int tournamentId) => throw new NotImplementedException();

    public Task StartTournamentAsync(int tournamentId) => throw new NotImplementedException();

    public Task GetStandingsAsync(int tournamentId) => throw new NotImplementedException();

    public Task GetBracketAsync(int tournamentId) => throw new NotImplementedException();

    public Task GetByIdAsync(int id) => throw new NotImplementedException();

    public Task GetAllAsync() => throw new NotImplementedException();
}
