using System.Security.Claims;
using LoPartidet.API.Models;
using LoPartidet.API.Models.Enums;
using LoPartidet.API.Services.Interfaces;
using LoPartidet.API.Services.Validators;
using LoPartidet.API.Services.Validators.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoPartidet.API.Controllers;

[ApiController]
[Route("users")]
[Authorize(Roles = nameof(Role.Player))]
public class UsersController(IUsersService usersService, IUserValidationService userValidationService) : ControllerBase
{
    [HttpGet("me")]
    public async Task<ActionResult<UserMeDto>> GetMe()
    {
        var identityId = User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (identityId is null) return Unauthorized();
        var me = await usersService.GetMeByIdentityIdAsync(identityId);
        return me is null ? NotFound() : Ok(me);
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<UserDto>> GetById(int id)
    {
        var user = await usersService.GetByIdAsync(id);
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

    //[HttpPatch("{id}")]
    //public async Task<ActionResult<UserDto>> UpdateUser(int id, UpdateUserRequest request)
    //{
    //    var user = await usersService.UpdateUserAsync(id, request);
    //    return user is null ? NotFound() : Ok(user);
    //}

    [HttpPut("{id}")]
    public async Task<ActionResult<UserDto>> PutUser(int id, UpdateUserRequest request)
    {
        var validation = await userValidationService.ValidateUpdateUserAsync(
            new UpdateUserValidationRequest(id, request.Name, request.Surname, request.Nickname, request.Email));
        if (!validation.IsValid)
            return BadRequest(validation.Error);

        var user = await usersService.UpdateUserAsync(id, request);
        return user is null ? NotFound() : Ok(user);
    }
}
