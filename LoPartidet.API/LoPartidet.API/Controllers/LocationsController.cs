using LoPartidet.API.Models;
using LoPartidet.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace LoPartidet.API.Controllers;

[ApiController]
[Route("locations")]
[Authorize]
public class LocationsController(ILocationsService locationsService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<LocationDto>>> GetAll()
    {
        var result = await locationsService.GetAllAsync();
        return Ok(result);
    }
}
