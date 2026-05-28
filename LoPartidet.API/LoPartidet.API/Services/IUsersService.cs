using LoPartidet.API.Models;

namespace LoPartidet.API.Services;

public interface IUsersService
{
    Task<UserDto?> GetByIdAsync(int id);
    Task<UserMeDto?> GetMeByIdentityIdAsync();
    Task<RegisterUserResponse?> RegisterUserAsync(RegisterUserDto request);
    Task<UserDto> CreateUserAsync(CreateUserRequest request);
    Task<UserDto?> UpdateUserAsync(int id, UpdateUserRequest request);
}
