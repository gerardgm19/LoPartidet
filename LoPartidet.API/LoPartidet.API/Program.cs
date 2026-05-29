using LoPartidet.API.Authentication;
using LoPartidet.API.Data;
using LoPartidet.API.Services;
using LoPartidet.API.Services.Interfaces;
using LoPartidet.API.Services.Validators;
using Microsoft.AspNetCore.Authentication;
using Microsoft.EntityFrameworkCore;
using NLog;
using NLog.Web;

var logger = LogManager.Setup()
    .LoadConfigurationFromFile("nlog.config")
    .GetCurrentClassLogger();

try
{
    logger.Info("Starting LoPartidet.API host");

    var builder = WebApplication.CreateBuilder(args);

    builder.Logging.ClearProviders();
    builder.Host.UseNLog();

    builder.Services.AddDbContext<LoPartidetContext>(options =>
        options.UseMySql(
            builder.Configuration.GetConnectionString("DefaultConnection"),
            new MySqlServerVersion(new Version(8, 0))));

    builder.Services.AddScoped<IMatchesService, MatchesService>();
    builder.Services.AddScoped<IUsersService, UsersService>();
    builder.Services.AddScoped<IPlayerSkillsService, PlayerSkillsService>();
    builder.Services.AddScoped<IMatchValidationService, MatchValidationService>();
    builder.Services.AddScoped<IUserValidationService, UserValidationService>();

    builder.Services.AddHttpClient();
    builder.Services.AddHttpClient<IIdentityManagerService, IdentityManagerService>(client =>
    {
        client.BaseAddress = new Uri(builder.Configuration["IdentityManager:BaseUrl"]!);
    });

    builder.Services.AddAuthentication("RemoteJwt")
        .AddScheme<AuthenticationSchemeOptions, RemoteJwtAuthHandler>("RemoteJwt", null);

    builder.Services.AddCors(options =>
        options.AddDefaultPolicy(policy =>
            policy.AllowAnyOrigin().AllowAnyHeader().AllowAnyMethod()));

    builder.Services.AddControllers();
    builder.Services.AddOpenApi();

    var app = builder.Build();

    using (var scope = app.Services.CreateScope())
    {
        scope.ServiceProvider.GetRequiredService<LoPartidetContext>().Database.Migrate();
    }

    if (app.Environment.IsDevelopment())
    {
        app.MapOpenApi();
    }

    app.UseCors();

    app.UseAuthentication();
    app.UseAuthorization();

    app.MapControllers();

    app.Run();
}
catch (Exception ex) when (ex is not Microsoft.Extensions.Hosting.HostAbortedException)
{
    logger.Error(ex, "LoPartidet.API host terminated unexpectedly");
    throw;
}
finally
{
    LogManager.Shutdown();
}
