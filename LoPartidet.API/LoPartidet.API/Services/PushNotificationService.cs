using LoPartidet.API.Services.Interfaces;
using System.Text;
using System.Text.Json;

namespace LoPartidet.API.Services;

public class PushNotificationService(HttpClient httpClient) : IPushNotificationService
{
    private const string ExpoApiUrl = "https://exp.host/--/api/v2/push/send";

    public async Task SendAsync(IEnumerable<string> tokens, string title, string body)
    {
        var messages = tokens.Select(token => new { to = token, title, body, sound = "default" });
        var json = JsonSerializer.Serialize(messages);
        var content = new StringContent(json, Encoding.UTF8, "application/json");

        try
        {
            await httpClient.PostAsync(ExpoApiUrl, content);
        }
        catch
        {
            // Push notifications are best-effort; don't fail the request
        }
    }
}
