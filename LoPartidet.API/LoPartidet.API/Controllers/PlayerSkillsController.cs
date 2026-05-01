using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoPartidet.API.Controllers;

[ApiController]
[Route("player-skills")]
[Authorize]
public class PlayerSkillsController(IPlayerSkillsService playerSkillsService) : ControllerBase
{
    [HttpGet("user/{userId}")]
    public ActionResult<IEnumerable<PlayerSkill>> GetByUser(int userId) =>
        Ok(playerSkillsService.GetByUserId(userId));

    [HttpPost]
    public ActionResult<PlayerSkill> Create(CreatePlayerSkillRequest request)
    {
        var skill = playerSkillsService.Create(request);
        return CreatedAtAction(nameof(GetByUser), new { userId = skill.UserId }, skill);
    }

    [HttpPut("{id}")]
    public ActionResult<PlayerSkill> Update(string id, UpdatePlayerSkillRequest request)
    {
        var skill = playerSkillsService.Update(id, request);
        return skill is null ? NotFound() : Ok(skill);
    }
}
