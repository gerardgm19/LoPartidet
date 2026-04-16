namespace LoPartidet.API.Services.Validators;

public record ValidationResult(bool IsValid, string? Error = null)
{
    public static ValidationResult Ok() => new(true);
    public static ValidationResult Fail(string error) => new(false, error);
}
