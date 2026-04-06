using IdentityManager.Models;
using IdentityManager.Services;
using Microsoft.AspNetCore.Mvc;

namespace IdentityManager.Controllers;

[ApiController]
[Route("auth")]
public class AuthController(IAuthService authService) : ControllerBase
{
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        try
        {
            var response = await authService.RegisterAsync(request);
            return Ok(response);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(new { error = ex.Message });
        }
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var response = await authService.LoginAsync(request);
        return response is null ? Unauthorized() : Ok(response);
    }
}
