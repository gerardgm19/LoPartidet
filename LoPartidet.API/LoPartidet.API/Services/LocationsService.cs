using LoPartidet.API.Data;
using LoPartidet.API.Entities;
using LoPartidet.API.Models;
using LoPartidet.API.Services.Interfaces;
using LoPartidet.API.Services.Validators.Interfaces;
using LoPartidet.API.Services.Validators.Models;
using Microsoft.EntityFrameworkCore;

namespace LoPartidet.API.Services;

public class LocationsService(
    LoPartidetContext db,
    ILocationValidationService validationService,
    ILogger<LocationsService> logger) : ILocationsService
{
    public async Task<IReadOnlyList<LocationDto>> GetAllAsync() =>
        await db.Locations
            .OrderBy(l => l.Name)
            .Select(l => new LocationDto(l.Id, l.Name, l.Description))
            .ToListAsync();

    public async Task<LocationDto> CreateAsync(CreateLocationDto request)
    {
        var validation = await validationService.ValidateCreateLocationAsync(
            new CreateLocationValidationRequest(request.Name));
        if (!validation.IsValid)
        {
            logger.LogWarning("Location creation rejected: {Error}", validation.Error);
            throw new InvalidOperationException(validation.Error);
        }

        var location = new Location
        {
            Name = request.Name.Trim(),
            Description = request.Description?.Trim() ?? string.Empty,
        };

        db.Locations.Add(location);
        await db.SaveChangesAsync();

        logger.LogInformation("Location {LocationId} created with name {Name}", location.Id, location.Name);
        return new LocationDto(location.Id, location.Name, location.Description);
    }

    public async Task<LocationDto> UpdateAsync(int id, UpdateLocationDto request)
    {
        var validation = await validationService.ValidateUpdateLocationAsync(
            new UpdateLocationValidationRequest(id, request.Name));
        if (!validation.IsValid)
        {
            logger.LogWarning("Location {LocationId} update rejected: {Error}", id, validation.Error);
            throw new InvalidOperationException(validation.Error);
        }

        var location = await db.Locations.FirstAsync(l => l.Id == id);

        // Location properties use init accessors; update through the change tracker.
        var entry = db.Entry(location);
        entry.Property(l => l.Name).CurrentValue = request.Name.Trim();
        entry.Property(l => l.Description).CurrentValue = request.Description?.Trim() ?? string.Empty;

        await db.SaveChangesAsync();

        logger.LogInformation("Location {LocationId} updated", id);
        return new LocationDto(location.Id, location.Name, location.Description);
    }

    public async Task DeleteAsync(int id)
    {
        var validation = await validationService.ValidateDeleteLocationAsync(
            new DeleteLocationValidationRequest(id));
        if (!validation.IsValid)
        {
            logger.LogWarning("Location {LocationId} deletion rejected: {Error}", id, validation.Error);
            throw new InvalidOperationException(validation.Error);
        }

        var location = await db.Locations.FirstAsync(l => l.Id == id);
        db.Locations.Remove(location);
        await db.SaveChangesAsync();

        logger.LogInformation("Location {LocationId} deleted", id);
    }
}
