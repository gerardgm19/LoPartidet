using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Services;
using LoPartidet.API.Services.Validators;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoPartidet.API.Controllers;

[ApiController]
[Route("matches")]
[Authorize]
public class MatchesController(IMatchesService matchesService, IMatchValidationService validationService) : ControllerBase
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

    [HttpPost("{id}/join")]
    public async Task<ActionResult<UserMatch>> JoinMatch(int id, JoinMatchDto request)
    {
        var validationRequest = new JoinMatchValidationRequest(id, request.UserId);
        var validation = await validationService.ValidateJoinMatchAsync(validationRequest);
        if (!validation.IsValid)
            return BadRequest(validation.Error);

        var userMatch = await matchesService.JoinMatchAsync(id, int.Parse(request.UserId));
        return Ok(userMatch);
    }
}
