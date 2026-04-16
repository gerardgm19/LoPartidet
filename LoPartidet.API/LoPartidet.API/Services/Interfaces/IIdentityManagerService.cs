using LoPartidet.API.Models;

namespace LoPartidet.API.Services.Interfaces;

public interface IIdentityManagerService
{
    Task<IdentityRegisterResponse?> RegisterAsync(string name, string surname, string nickname, string email, string password);
}
