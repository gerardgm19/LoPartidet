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

    [HttpGet("{id}")]
    public async Task<ActionResult<TournamentDto>> GetTournamentById(int id)
    {
        var result = await tournamentService.GetByIdAsync(id);
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
        var result = await tournamentService.GetTeamsByTournamentAsync(id);
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
