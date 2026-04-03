# LoPartidet

Expo Router (v6) app built with React Native.

## Project language
English only — all code, file names, comments, and UI text must be in English.

## Structure
- `app/` — Expo Router screens and layouts
  - `(tabs)/` — bottom tab navigator (Matches, Profile)
- `services/` — business logic and data access (no UI)
- `assets/` — images and fonts

## Key conventions
- Services live in `services/` and contain no UI code.
- Screens are thin — they call services, not raw fetch/DB logic.
- No default exports from service files; use named exports.
- TypeScript strict mode is enabled.

## Running the app
```bash
npx expo start
```
