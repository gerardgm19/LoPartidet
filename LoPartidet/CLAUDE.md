# LoPartidet

Expo Router (v6) app built with React Native.

## Project language
English only — all code, file names, comments, and UI text must be in English.

## Structure
- `app/` — Expo Router screens and layouts
  - `(tabs)/` — bottom tab navigator (Matches, Profile)
  - `match/[id].tsx` — match detail screen
  - `player-details.tsx` — editable player attributes (position, foot, skill, speed, jersey, height)
  - `settings.tsx` — user account info (name, surname, nickname, email, city, birthday)
  - `about-us.tsx` — app info with animated logo (5-tap easter egg)
- `services/` — business logic and data access (no UI)
- `components/` — reusable UI components
- `mocks/` — mock data for development
- `constants/` — shared constants (colors)
- `assets/` — images and fonts

## Key conventions
- Services live in `services/` and contain no UI code.
- Screens are thin — they call services, not raw fetch/DB logic.
- No default exports from service files; use named exports.
- TypeScript strict mode is enabled.
- All screens use `SafeAreaView` with `edges={["top", "bottom"]}`.
- Stack screens set `<Stack.Screen options={{ headerShown: false }} />` inline and implement their own header with a back chevron.
- Color palette is in `constants/colors.ts` — always use `Colors.*`, never hardcode hex values.

## Running the app
```bash
npx expo start
```
