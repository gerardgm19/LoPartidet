using System.Net.Http.Headers;
using System.Security.Claims;
using System.Text.Encodings.Web;
using LoPartidet.API.Models;
using Microsoft.AspNetCore.Authentication;
using Microsoft.Extensions.Options;

namespace LoPartidet.API.Authentication;

public class RemoteJwtAuthHandler(
    IOptionsMonitor<AuthenticationSchemeOptions> options,
    ILoggerFactory logger,
    UrlEncoder encoder,
    IHttpClientFactory httpClientFactory,
    IConfiguration config)
    : AuthenticationHandler<AuthenticationSchemeOptions>(options, logger, encoder)
{
    protected override async Task<AuthenticateResult> HandleAuthenticateAsync()
    {
        if (!Request.Headers.TryGetValue("Authorization", out var authHeader))
            return AuthenticateResult.NoResult();

        var header = authHeader.ToString();
        if (!header.StartsWith("Bearer ", StringComparison.OrdinalIgnoreCase))
            return AuthenticateResult.NoResult();

        var token = header["Bearer ".Length..].Trim();

        var client = httpClientFactory.CreateClient();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", token);

        HttpResponseMessage response;
        try
        {
            response = await client.GetAsync($"{config["IdentityManager:BaseUrl"]}/auth/validate");
        }
        catch
        {
            return AuthenticateResult.Fail("IdentityManager unreachable");
        }

        if (!response.IsSuccessStatusCode)
            return AuthenticateResult.Fail("Invalid token");

        var result = await response.Content.ReadFromJsonAsync<ValidateResponse>();
        if (result is null)
            return AuthenticateResult.Fail("Invalid response from IdentityManager");

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, result.UserId),
            new Claim(ClaimTypes.Email, result.Email),
        };
        var ticket = new AuthenticationTicket(
            new ClaimsPrincipal(new ClaimsIdentity(claims, Scheme.Name)),
            Scheme.Name);

        return AuthenticateResult.Success(ticket);
    }
}
