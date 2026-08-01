using System.Net.Http.Json;
using LoPartidet.API.Models;
using LoPartidet.API.Services.Interfaces;

namespace LoPartidet.API.Services;

public class IdentityManagerService(HttpClient httpClient, ILogger<IdentityManagerService> logger) : IIdentityManagerService
{
    public async Task<IdentityRegisterResult> RegisterAsync(string name, string surname, string nickname, string email, string password)
    {
        var response = await httpClient.PostAsJsonAsync("/auth/register", new
        {
            Name = name,
            Surname = surname,
            Nickname = nickname,
            Email = email,
            Password = password
        });

        if (response.IsSuccessStatusCode)
        {
            var body = await response.Content.ReadFromJsonAsync<IdentityRegisterResponse>();
            return new IdentityRegisterResult(true, body, null);
        }

        var error = await ReadErrorAsync(response);
        logger.LogWarning("IdentityManager register failed for {Email} ({StatusCode}): {Error}",
            email, (int)response.StatusCode, error);
        return new IdentityRegisterResult(false, null, error);
    }

    private static async Task<string> ReadErrorAsync(HttpResponseMessage response)
    {
        try
        {
            var body = await response.Content.ReadFromJsonAsync<IdentityErrorResponse>();
            if (!string.IsNullOrWhiteSpace(body?.Error)) return body.Error;
        }
        catch (Exception)
        {
            // Response body was not the expected { error } JSON shape; fall back to a generic message.
        }

        return "Registration failed.";
    }
}
