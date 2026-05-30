using LoPartidet.API.Models.Enums;

namespace LoPartidet.API.Models;

public record UserMeDto(int UserId, List<Role> Roles);
