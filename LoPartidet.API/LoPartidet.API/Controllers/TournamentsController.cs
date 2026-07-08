using System.Security.Claims;
using LoPartidet.API.Models;
using LoPartidet.API.Models.Enums;
using LoPartidet.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoPartidet.API.Controllers;

[ApiController]
[Route("tournaments")]
[Authorize]
public class TournamentsController(ITournamentService tournamentService) : ControllerBase
{
    [HttpPost]
    [Authorize(Roles = nameof(Role.Admin))]
    public async Task<ActionResult<TournamentDto>> CreateTournament(CreateTournamentDto request)
    {
        try
        {
            var result = await tournamentService.CreateAsync(request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}")]
    [Authorize(Roles = nameof(Role.Admin))]
    public async Task<ActionResult<TournamentDto>> UpdateTournament(int id, UpdateTournamentDto request)
    {
        try
        {
            var result = await tournamentService.UpdateAsync(id, request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<TournamentDetailDto>> GetTournamentById(int id)
    {
        var identityId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await tournamentService.GetByIdAsync(id, identityId);
        if (result is null) return NotFound();
        return Ok(result);
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<TournamentDto>>> GetAllTournaments()
    {
        var result = await tournamentService.GetAllAsync();
        return Ok(result);
    }

    [HttpGet("{id}/teams")]
    public async Task<ActionResult<IReadOnlyList<TeamDto>>> GetTeams(int id)
    {
        var identityId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var result = await tournamentService.GetTeamsByTournamentAsync(id, identityId);
        return Ok(result);
    }

    [HttpPost("{id}/teams")]
    [Authorize(Roles = nameof(Role.Player))]
    public async Task<ActionResult<TeamDto>> AddTeam(int id, CreateTeamDto request)
    {
        var identityId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (identityId is null) return Unauthorized();
        try
        {
            var result = await tournamentService.AddTeamAsync(id, request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    #region Test methods

    [HttpPost("{id}/test-teams")]
    [Authorize(Roles = nameof(Role.Admin))]
    public async Task<ActionResult<IReadOnlyList<TeamDto>>> GenerateTestTeams(int id)
    {
        try
        {
            var result = await tournamentService.GenerateTestTeams(id);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpGet("{id}/preview")]
    [Authorize(Roles = nameof(Role.Admin))]
    public async Task<ActionResult<TournamentPreviewDto>> GetTestGroupsAndMatches(int id)
    {
        try
        {
            var result = await tournamentService.GetTestTournamentGroupsAndMatchesAsync(id);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    #endregion

    [HttpPost("{id}/locations")]
    [Authorize(Roles = nameof(Role.Admin))]
    public async Task<ActionResult<TournamentLocationDto>> AddLocation(int id, AddTournamentLocationDto request)
    {
        try
        {
            var result = await tournamentService.AddLocationAsync(id, request);
            return Ok(result);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
