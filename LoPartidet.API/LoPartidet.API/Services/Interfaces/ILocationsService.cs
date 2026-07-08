using LoPartidet.API.Models;

namespace LoPartidet.API.Services.Interfaces;

public interface ILocationsService
{
    Task<IReadOnlyList<LocationDto>> GetAllAsync();
    Task<LocationDto> CreateAsync(CreateLocationDto request);
    Task<LocationDto> UpdateAsync(int id, UpdateLocationDto request);
    Task DeleteAsync(int id);
}
