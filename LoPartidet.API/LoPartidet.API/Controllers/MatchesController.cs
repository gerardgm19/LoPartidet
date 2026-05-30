using LoPartidet.API.Models;
using LoPartidet.API.Services.Interfaces;
using LoPartidet.API.Services.Validators;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LoPartidet.API.Controllers;

[ApiController]
[Route("matches")]
[Authorize(Roles = nameof(Role.Player))]
public class MatchesController(IMatchesService matchesService, IMatchValidationService validationService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<MatchDto>>> GetAll([FromQuery] MatchFilterDto filter)
    {
        var identityId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        return Ok(await matchesService.GetAllAsync(identityId!, filter));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MatchDetailDto>> GetById(int id)
    {
        var match = await matchesService.GetByIdAsync(id);
        return match is null ? NotFound() : Ok(match);
    }

    [HttpPost]
    public async Task<ActionResult<MatchDto>> CreateMatch(CreateMatchDto request)
    {
        try
        {
            var match = await matchesService.CreateMatchAsync(request);
            return CreatedAtAction(nameof(GetById), new { id = match.Id }, match);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPost("{id}/join")]
    public async Task<ActionResult<UserMatchDto>> JoinMatch(int id, JoinMatchDto request)
    {
        var validationRequest = new JoinMatchValidationRequest(id, request.UserId);
        var validation = await validationService.ValidateJoinMatchAsync(validationRequest);
        if (!validation.IsValid)
            return BadRequest(validation.Error);

        var userMatch = await matchesService.JoinMatchAsync(id, int.Parse(request.UserId));
        return Ok(userMatch);
    }

    [HttpDelete("{id}/join")]
    public async Task<IActionResult> UnjoinMatch(int id, [FromBody] JoinMatchDto request)
    {
        var validationRequest = new UnjoinMatchValidationRequest(id, request.UserId);
        var validation = await validationService.ValidateUnjoinMatchAsync(validationRequest);
        if (!validation.IsValid)
            return BadRequest(validation.Error);

        await matchesService.UnjoinMatchAsync(id, int.Parse(request.UserId));
        return NoContent();
    }
}
