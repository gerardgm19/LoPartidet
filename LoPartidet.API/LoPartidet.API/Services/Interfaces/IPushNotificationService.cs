namespace LoPartidet.API.Services.Interfaces;

public interface IPushNotificationService
{
    Task SendAsync(IEnumerable<string> tokens, string title, string body);
}
