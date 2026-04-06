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
- `Models/` — enums and request/response records (one per file)
- One type per file — every class, record, enum, and interface in its own `.cs` file
- Services registered as `Scoped`; screens call services, never raw DB logic

## Running

```bash
# Frontend
cd LoPartidet && npx expo start

# Backend
cd LoPartidet.API/LoPartidet.API && dotnet run
```
