using LoPartidet.API.Models;

namespace LoPartidet.API.Services.Interfaces;

public interface IRequestInformation
{
    bool IsAuthenticated { get; }
    int? UserId { get; }
    IReadOnlyList<Role> Roles { get; }
}
