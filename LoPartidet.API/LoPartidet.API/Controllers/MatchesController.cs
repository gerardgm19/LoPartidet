using LoPartidet.API.Entities;
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
}
