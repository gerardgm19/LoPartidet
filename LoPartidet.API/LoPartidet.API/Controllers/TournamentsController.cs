using LoPartidet.API.Models;
using LoPartidet.API.Models.Enums;
using LoPartidet.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoPartidet.API.Controllers;

[ApiController]
[Route("tournaments")]
[Authorize(Roles = nameof(Role.Admin))]
public class TournamentsController(ITournamentService tournamentService) : ControllerBase
{
    [HttpPost("{id}/locations")]
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
