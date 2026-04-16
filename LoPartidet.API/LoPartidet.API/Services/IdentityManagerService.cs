using System.Net.Http.Json;
using LoPartidet.API.Models;
using LoPartidet.API.Services.Interfaces;

namespace LoPartidet.API.Services;

public class IdentityManagerService(HttpClient httpClient) : IIdentityManagerService
{
    public async Task<IdentityRegisterResponse?> RegisterAsync(string name, string surname, string nickname, string email, string password)
    {
        var response = await httpClient.PostAsJsonAsync("/auth/register", new
        {
            Name = name,
            Surname = surname,
            Nickname = nickname,
            Email = email,
            Password = password
        });

        if (!response.IsSuccessStatusCode) return null;

        return await response.Content.ReadFromJsonAsync<IdentityRegisterResponse>();
    }
}
