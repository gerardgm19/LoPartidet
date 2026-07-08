using LoPartidet.API.Data;
using LoPartidet.API.Services.Validators.Interfaces;
using LoPartidet.API.Services.Validators.Models;
using Microsoft.EntityFrameworkCore;

namespace LoPartidet.API.Services.Validators;

public class LocationValidationService(LoPartidetContext db) : ILocationValidationService
{
    public async Task<ValidationResult> ValidateCreateLocationAsync(CreateLocationValidationRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.Name))
            return ValidationResult.Fail("Location name is required.");

        var nameTaken = await db.Locations
            .AnyAsync(l => l.Name.ToLower() == request.Name.Trim().ToLower());
        if (nameTaken)
            return ValidationResult.Fail("A location with this name already exists.");

        return ValidationResult.Ok();
    }

    public async Task<ValidationResult> ValidateUpdateLocationAsync(UpdateLocationValidationRequest request)
    {
        var location = await db.Locations.FindAsync(request.LocationId);
        if (location is null)
            return ValidationResult.Fail("Location not found.");

        if (string.IsNullOrWhiteSpace(request.Name))
            return ValidationResult.Fail("Location name is required.");

        var nameTaken = await db.Locations
            .AnyAsync(l => l.Id != request.LocationId
                && l.Name.ToLower() == request.Name.Trim().ToLower());
        if (nameTaken)
            return ValidationResult.Fail("A location with this name already exists.");

        return ValidationResult.Ok();
    }

    public async Task<ValidationResult> ValidateDeleteLocationAsync(DeleteLocationValidationRequest request)
    {
        var location = await db.Locations.FindAsync(request.LocationId);
        if (location is null)
            return ValidationResult.Fail("Location not found.");

        var usedByMatch = await db.Matches.AnyAsync(m => m.LocationId == request.LocationId);
        if (usedByMatch)
            return ValidationResult.Fail("Cannot delete a location that is used by one or more matches.");

        var usedByTournament = await db.TournamentLocations.AnyAsync(tl => tl.LocationId == request.LocationId);
        if (usedByTournament)
            return ValidationResult.Fail("Cannot delete a location that is assigned to one or more tournaments.");

        return ValidationResult.Ok();
    }
}
