using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using IdentityManager.Models;
using IdentityManager.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace IdentityManager.Controllers;

[ApiController]
[Route("auth")]
public class AuthController(IAuthService authService, IConfiguration config) : ControllerBase
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

    [HttpGet("validate")]
    public ActionResult<ValidateResponse> Validate()
    {
        var authHeader = Request.Headers.Authorization.ToString();
        if (!authHeader.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return Unauthorized();

        var token = authHeader["Bearer ".Length..].Trim();

        try
        {
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
            var principal = new JwtSecurityTokenHandler().ValidateToken(token,
                new TokenValidationParameters
                {
                    ValidateIssuerSigningKey = true,
                    IssuerSigningKey = key,
                    ValidateIssuer = true,
                    ValidIssuer = config["Jwt:Issuer"],
                    ValidateAudience = true,
                    ValidAudience = config["Jwt:Audience"],
                    ValidateLifetime = true,
                    ClockSkew = TimeSpan.Zero,
                }, out _);

            var userId = principal.FindFirstValue(ClaimTypes.NameIdentifier)
                      ?? principal.FindFirstValue(JwtRegisteredClaimNames.Sub);
            var email  = principal.FindFirstValue(ClaimTypes.Email)
                      ?? principal.FindFirstValue(JwtRegisteredClaimNames.Email);

            if (userId is null) return Unauthorized();

            return Ok(new ValidateResponse(userId, email ?? ""));
        }
        catch
        {
            return Unauthorized();
        }
    }
}
