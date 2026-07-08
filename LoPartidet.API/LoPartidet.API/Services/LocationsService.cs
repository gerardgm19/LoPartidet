using LoPartidet.API.Data;
using LoPartidet.API.Models;
using LoPartidet.API.Services.Interfaces;
using Microsoft.EntityFrameworkCore;

namespace LoPartidet.API.Services;

public class LocationsService(LoPartidetContext db) : ILocationsService
{
    public async Task<IReadOnlyList<LocationDto>> GetAllAsync() =>
        await db.Locations
            .OrderBy(l => l.Name)
            .Select(l => new LocationDto(l.Id, l.Name))
            .ToListAsync();
}
