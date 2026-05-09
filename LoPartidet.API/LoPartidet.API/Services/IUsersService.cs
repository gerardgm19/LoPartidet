using LoPartidet.API.Models;

namespace LoPartidet.API.Services;

public interface IUsersService
{
    UserDto? GetById(int id);
    int GetUserIdByIdentityId(string identityId);
    Task<RegisterUserResponse?> RegisterUserAsync(RegisterUserDto request);
    UserDto CreateUser(CreateUserRequest request);
    UserDto? UpdateUser(int id, UpdateUserRequest request);
}
