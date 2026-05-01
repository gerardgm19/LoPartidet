namespace LoPartidet.API.Entities;

public class ConversationParticipant
{
    public string ConversationId { get; set; } = string.Empty;
    public int UserId { get; set; }
    public DateTime JoinedAt { get; set; }

    public Conversation Conversation { get; set; } = null!;
    public User User { get; set; } = null!;
}
