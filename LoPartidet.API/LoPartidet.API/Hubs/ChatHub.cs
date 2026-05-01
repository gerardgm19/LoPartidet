using LoPartidet.API.Services;
using LoPartidet.API.Services.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace LoPartidet.API.Hubs;

[Authorize]
public class ChatHub(IMessageService messageService, IConversationService conversationService, IUsersService usersService) : Hub
{
    public async Task JoinConversation(string conversationId)
    {
        var userId = GetUserId();
        if (!await conversationService.IsParticipantAsync(conversationId, userId))
        {
            await Clients.Caller.SendAsync("Error", "Not a participant of this conversation.");
            return;
        }
        await Groups.AddToGroupAsync(Context.ConnectionId, conversationId);
    }

    public async Task LeaveConversation(string conversationId)
    {
        await Groups.RemoveFromGroupAsync(Context.ConnectionId, conversationId);
    }

    public async Task SendMessage(string conversationId, string content)
    {
        var userId = GetUserId();

        if (!await conversationService.IsParticipantAsync(conversationId, userId))
        {
            await Clients.Caller.SendAsync("Error", "Not a participant of this conversation.");
            return;
        }

        var message = await messageService.SendMessageAsync(conversationId, userId, content);
        await Clients.Group(conversationId).SendAsync("ReceiveMessage", message);
    }

    private int GetUserId()
    {
        var identityId = Context.User!.FindFirstValue(ClaimTypes.NameIdentifier)!;
        var userId = usersService.GetUserIdByIdentityId(identityId);
        if (userId is 0) throw new HubException("User not found.");
        return userId;
    }
}
