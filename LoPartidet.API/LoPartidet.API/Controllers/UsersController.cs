using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoPartidet.API.Controllers;

[ApiController]
[Route("users")]
[Authorize]
public class UsersController(IUsersService usersService) : ControllerBase
{
    [HttpGet("{id}")]
    public ActionResult<User> GetById(int id)
    {
        var user = usersService.GetById(id);
        return user is null ? NotFound() : Ok(user);
    }

    [HttpPost]
    public ActionResult<User> CreateUser(CreateUserRequest request)
    {
        var user = usersService.CreateUser(request);
        return CreatedAtAction(nameof(GetById), new { id = user.Id }, user);
    }

    [HttpPatch("{id}")]
    public ActionResult<User> UpdateUser(int id, UpdateUserRequest request)
    {
        var user = usersService.UpdateUser(id, request);
        return user is null ? NotFound() : Ok(user);
    }
}
