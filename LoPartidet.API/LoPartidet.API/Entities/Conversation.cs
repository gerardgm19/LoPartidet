using LoPartidet.API.Models;

namespace LoPartidet.API.Entities;

public class Conversation
{
    public string Id { get; set; } = string.Empty;
    public ConversationType Type { get; set; }
    public string? Name { get; set; }

    public ICollection<ConversationParticipant> Participants { get; set; } = [];
    public ICollection<Message> Messages { get; set; } = [];
}
