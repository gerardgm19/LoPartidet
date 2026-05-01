using LoPartidet.API.Models;
using LoPartidet.API.Services;
using LoPartidet.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LoPartidet.API.Controllers;

[ApiController]
[Route("friendships")]
[Authorize]
public class FriendshipsController(IFriendshipService friendshipService, IUsersService usersService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<IEnumerable<FriendDto>>> GetFriends()
    {
        var userId = GetUserId();
        return Ok(await friendshipService.GetFriendsAsync(userId));
    }

    [HttpGet("requests")]
    public async Task<ActionResult<IEnumerable<PendingFriendRequestDto>>> GetPendingRequests()
    {
        var userId = GetUserId();
        return Ok(await friendshipService.GetPendingRequestsAsync(userId));
    }

    [HttpPost("request")]
    public async Task<IActionResult> SendFriendRequest(SendFriendRequestDto request)
    {
        var userId = GetUserId();
        try
        {
            var friendship = await friendshipService.SendFriendRequestAsync(userId, request.AddresseeId);
            return Ok(new { id = friendship.Id });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}/accept")]
    public async Task<IActionResult> AcceptRequest(string id)
    {
        var userId = GetUserId();
        try
        {
            var friendship = await friendshipService.AcceptFriendRequestAsync(id, userId);
            return Ok(new { id = friendship.Id });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    [HttpPut("{id}/block")]
    public async Task<IActionResult> BlockUser(string id)
    {
        var userId = GetUserId();
        try
        {
            var friendship = await friendshipService.BlockUserAsync(id, userId);
            return Ok(new { id = friendship.Id });
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

    private int GetUserId()
    {
        var identityId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        return usersService.GetUserIdByIdentityId(identityId);
    }
}
