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
    public ActionResult<Match> GetById(string id)
    {
        var match = matchesService.GetById(id);
        return match is null ? NotFound() : Ok(match);
    }

    [HttpPost]
    public ActionResult<Match> CreateMatch(CreateMatchDto request)
    {
        var match = matchesService.CreateMatch(request);
        return CreatedAtAction(nameof(GetById), new { id = match.Id }, match);
    }
}
