using LoPartidet.API.Entities;

namespace LoPartidet.API.Models;

public record RegisterUserResponse(User User, string Token);
