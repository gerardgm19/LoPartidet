using LoPartidet.API.Models;
using LoPartidet.API.Models.Enums;
using LoPartidet.API.Services.Interfaces;
using LoPartidet.API.Services.Validators;
using LoPartidet.API.Services.Validators.Interfaces;
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

    [HttpGet("{id}/can-edit")]
    public async Task<ActionResult<CanEditMatchDto>> CanEditMatch(int id)
    {
        var identityId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var isAdmin = User.IsInRole(nameof(Role.Admin));
        var result = await validationService.ValidateCanEditMatchAsync(id, identityId, isAdmin);
        return Ok(new CanEditMatchDto(result.IsValid));
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

    [HttpPut("{id}")]
    [Authorize(Roles = nameof(Role.Player) + "," + nameof(Role.Admin))]
    public async Task<ActionResult<MatchDto>> UpdateMatch(int id, UpdateMatchDto request)
    {
        var identityId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var isAdmin = User.IsInRole(nameof(Role.Admin));
        var validation = await validationService.ValidateUpdateMatchAsync(
            new UpdateMatchValidationRequest(id, identityId, isAdmin, request.Date, request.Location, request.MaxPlayers, request.DurationInMinutes));
        if (!validation.IsValid)
            return BadRequest(validation.Error);

        var match = await matchesService.UpdateMatchAsync(id, request);
        return Ok(match);
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

    [HttpDelete("{id}")]
    [Authorize(Roles = nameof(Role.Player) + "," + nameof(Role.Admin))]
    public async Task<IActionResult> DeleteMatch(int id)
    {
        var identityId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var isAdmin = User.IsInRole(nameof(Role.Admin));
        var validation = await validationService.ValidateDeleteMatchAsync(
            new DeleteMatchValidationRequest(id, identityId, isAdmin));
        if (!validation.IsValid)
            return BadRequest(validation.Error);

        await matchesService.DeleteMatchAsync(id);
        return NoContent();
    }

    [HttpPost("{id}/cancel")]
    [Authorize(Roles = nameof(Role.Player) + "," + nameof(Role.Admin))]
    public async Task<IActionResult> CancelMatch(int id)
    {
        var identityId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var isAdmin = User.IsInRole(nameof(Role.Admin));
        var validation = await validationService.ValidateCancelMatchAsync(
            new CancelMatchValidationRequest(id, identityId, isAdmin));
        if (!validation.IsValid)
            return BadRequest(validation.Error);

        await matchesService.CancelMatchAsync(id);
        return NoContent();
    }
}
