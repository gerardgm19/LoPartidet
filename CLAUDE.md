# LoPartidet

A football match organizer app with a React Native frontend and a .NET REST API backend.

## Structure

```
LoPartidet/          → Expo Router (React Native) app
LoPartidet.API/      → ASP.NET Core Web API
```

See each sub-project's `CLAUDE.md` for detailed conventions.

## Frontend — `LoPartidet/`
- React Native with Expo Router v6
- Screens in `app/`, shared UI in `components/`, business logic in `services/`
- Colors always via `Colors.*` from `constants/colors.ts` — never hardcode hex values
- All UI text, code, and file names in English

## Backend — `LoPartidet.API/`
- .NET 10 · Entity Framework Core 9 · MySQL 8
- Layered: Controllers → Services (interface + impl) → DbContext
- `Entities/` — EF Core entity classes (one per file)
- `Models/` — request/response records (one per file)
- `Models/Enums/` — enums (one per file)
- `Services/` — service implementations
- `Services/Interfaces/` — service interfaces (one per file)
- One type per file — every class, record, enum, and interface in its own `.cs` file
- Entity primary keys are always `int` auto-incremental (EF identity). Never assign Ids manually
- Never return entity objects from controllers/services. Define a response DTO in `Models/`, map entity → DTO, return the DTO
- Services registered as `Scoped`; screens call services, never raw DB logic
- Authorization: `RemoteJwtAuthHandler` adds one `ClaimTypes.Role` claim per role from the user's `UserRoles`. Guard endpoints with `[Authorize(Roles = nameof(Role.X))]` (e.g. `nameof(Role.Player)`). For multiple roles: `[Authorize(Roles = nameof(Role.Admin) + "," + nameof(Role.Referee))]` (OR semantics). Do not introduce named policies for plain role checks
- Logging: NLog wired in `Program.cs` via `nlog.config` (console + `logs/lopartidet-*.log` general + `logs/lopartidet-errors-*.log` errors-only). Inject `ILogger<T>` via primary constructor in controllers and services. **Always log errors** in `catch` blocks with `logger.LogError(ex, "...")` — never swallow exceptions silently. **Always log relevant information**: state-changing operations (create/update/delete), external calls (HTTP, IdentityManager), validation failures (`LogWarning`), and significant business events. Use structured logging with named placeholders (`logger.LogInformation("Match {MatchId} created by {UserId}", id, userId)`) — never string interpolation

## Running

```bash
# Frontend
cd LoPartidet && npx expo start

# Backend
cd LoPartidet.API/LoPartidet.API && dotnet run
```
