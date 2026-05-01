using LoPartidet.API.Models;
using LoPartidet.API.Services;
using LoPartidet.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;

namespace LoPartidet.API.Controllers;

[ApiController]
[Route("conversations")]
[Authorize]
public class ConversationsController(
    IConversationService conversationService,
    IMessageService messageService,
    IUsersService usersService) : ControllerBase
{
    [HttpGet("groups")]
    public async Task<ActionResult<IEnumerable<ConversationDto>>> GetGroups()
    {
        var userId = GetUserId();
        return Ok(await conversationService.GetGroupConversationsAsync(userId));
    }

    [HttpGet("direct")]
    public async Task<ActionResult<IEnumerable<ConversationDto>>> GetDirect()
    {
        var userId = GetUserId();
        return Ok(await conversationService.GetDirectConversationsAsync(userId));
    }

    [HttpGet("{id}/messages")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessages(
        string id, [FromQuery] int page = 1, [FromQuery] int pageSize = 50)
    {
        var userId = GetUserId();
        if (!await conversationService.IsParticipantAsync(id, userId))
            return Forbid();

        return Ok(await messageService.GetMessagesAsync(id, page, pageSize));
    }

    private int GetUserId()
    {
        var identityId = User.FindFirstValue(ClaimTypes.NameIdentifier)!;
        return usersService.GetUserIdByIdentityId(identityId);
    }
}
