using LoPartidet.API.Models;

namespace LoPartidet.API.Services.Interfaces;

public interface ILocationsService
{
    Task<IReadOnlyList<LocationDto>> GetAllAsync();
}
