using LoPartidet.API.Entities;
using LoPartidet.API.Models;

namespace LoPartidet.API.Services;

public interface IUsersService
{
    User? GetById(string id);
    User CreateUser(CreateUserRequest request);
    User? UpdateUser(string id, UpdateUserRequest request);
}
