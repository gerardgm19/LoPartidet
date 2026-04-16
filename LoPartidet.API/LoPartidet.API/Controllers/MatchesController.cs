using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoPartidet.API.Controllers;

[ApiController]
[Route("matches")]
[Authorize]
public class MatchesController(IMatchesService matchesService) : ControllerBase
{
    [HttpGet]
    public ActionResult<IEnumerable<Match>> GetAll() => Ok(matchesService.GetAll());

    [HttpGet("{id}")]
    public ActionResult<Match> GetById(int id)
    {
        var match = matchesService.GetById(id);
        return match is null ? NotFound() : Ok(match);
    }

    [HttpPost]
    public async Task<ActionResult<Match>> CreateMatch(CreateMatchDto request)
    {
        try
        {
            var match = await matchesService.CreateMatch(request);
            return CreatedAtAction(nameof(GetById), new { id = match.Id }, match);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
}
