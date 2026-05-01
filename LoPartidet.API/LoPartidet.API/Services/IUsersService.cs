using LoPartidet.API.Entities;
using LoPartidet.API.Models;

namespace LoPartidet.API.Services;

public interface IUsersService
{
    User? GetById(int id);
    int GetUserIdByIdentityId(string identityId);
    Task<RegisterUserResponse?> RegisterUserAsync(RegisterUserDto request);
    User CreateUser(CreateUserRequest request);
    User? UpdateUser(int id, UpdateUserRequest request);
    void RegisterPushToken(int userId, string token);
}
