using System.Security.Claims;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Services;
using LoPartidet.API.Services.Validators;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoPartidet.API.Controllers;

[ApiController]
[Route("users")]
[Authorize]
public class UsersController(IUsersService usersService, IUserValidationService userValidationService) : ControllerBase
{
    [HttpGet("me")]
    public ActionResult<User> GetMe()
    {
        var identityId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (identityId is null) return Unauthorized();
        var userId = usersService.GetUserIdByIdentityId(identityId);
        return userId is 0 ? NotFound() : Ok(userId);
    }

    [HttpGet("{id}")]
    public ActionResult<User> GetById(int id)
    {
        var user = usersService.GetById(id);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpPost]
    [AllowAnonymous]
    public async Task<ActionResult<RegisterUserResponse>> RegisterUser(RegisterUserDto request)
    {
        var result = await usersService.RegisterUserAsync(request);
        if (result is null) return BadRequest("Registration failed.");
        return CreatedAtAction(nameof(GetById), new { id = result.UserId }, result);
    }

    [HttpPatch("{id}")]
    public ActionResult<User> UpdateUser(int id, UpdateUserRequest request)
    {
        var user = usersService.UpdateUser(id, request);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpPut("{id}")]
    public async Task<ActionResult<User>> PutUser(int id, UpdateUserRequest request)
    {
        var validation = await userValidationService.ValidateUpdateUserAsync(
            new UpdateUserValidationRequest(id, request.Name, request.Surname, request.Nickname, request.Email));
        if (!validation.IsValid)
            return BadRequest(validation.Error);

        var user = usersService.UpdateUser(id, request);
        return user is null ? NotFound() : Ok(user);
    }
}
