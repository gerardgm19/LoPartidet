using LoPartidet.API.Models;
using LoPartidet.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoPartidet.API.Controllers;

[ApiController]
[Route("player-skills")]
[Authorize(Roles = nameof(Role.Player))]
public class PlayerSkillsController(IPlayerSkillsService playerSkillsService) : ControllerBase
{
    [HttpGet("user/{userId}")]
    public async Task<ActionResult<IEnumerable<PlayerSkillDto>>> GetByUser(int userId) =>
        Ok(await playerSkillsService.GetByUserIdAsync(userId));

    [HttpPost]
    public async Task<ActionResult<PlayerSkillDto>> Create(CreatePlayerSkillRequest request)
    {
        var skill = await playerSkillsService.CreateAsync(request);
        return CreatedAtAction(nameof(GetByUser), new { userId = skill.UserId }, skill);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<PlayerSkillDto>> Update(int id, UpdatePlayerSkillRequest request)
    {
        var skill = await playerSkillsService.UpdateAsync(id, request);
        return skill is null ? NotFound() : Ok(skill);
    }
}
