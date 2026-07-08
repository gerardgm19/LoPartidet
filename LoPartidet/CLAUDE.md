# LoPartidet

Expo Router (v6) app built with React Native.

## Project language
English only — all code, file names, and comments must be in English.
UI text is handled via the i18n system — never hardcode user-facing strings.

## Features

- **Auth** — login / register against the Identity API; JWT stored in `authStore`, auto-attached and 401-handled by `services/api.ts`.
- **Matches** — list with filters (`MatchFilters`), detail, create (`match/create-match`), join/leave, match events, and the current user's matches (`user-matches`).
- **Tournaments** — list tab, detail (`tournament/[id]`), create (`create-tournament`), admin edit (`edit-tournament`, Draft only), team creation (`create-team`), test-team generation, group/bracket preview, and results (`tournament/results/[id]`). Tournaments carry a set of **locations** managed from the edit screen.
- **Player profile** — account info (`profile`), editable player attributes / skills (`skills`, `player-information`): position, foot, skill level, speed, jersey, height.
- **Locations** — `locationsService` lists available locations (used by the tournament edit picker).
- **i18n** — Spanish (`es_es`) and Catalan (`cat_es`), switchable via `langStore`.
- **Theming** — light/dark palette via `themeStore`; colors consumed through `useThemeStore((s) => s.colors)`.
- **Roles** — `authStore.isAdmin()` gates admin-only UI (e.g. tournament edit button, test-team generation).

## Structure

```
app/
  _layout.tsx              — root Stack + SafeAreaProvider + auth guard + store bootstrap
  index.tsx                — redirects to (tabs)/matches or (auth)/login
  (auth)/
    _layout.tsx            — Stack for auth screens (no header)
    login.tsx
    register.tsx
  (tabs)/
    _layout.tsx            — bottom tab navigator (Matches, Tournaments, Profile)
    matches.tsx
    tournaments.tsx
    profile.tsx
  match/
    [id].tsx               — match detail screen
    create-match.tsx       — create a match
  tournament/
    [id].tsx               — tournament detail (admin edit button when Draft)
    create-tournament.tsx  — create a tournament
    edit-tournament.tsx    — admin edit (fields + locations), Draft only
    create-team.tsx        — join a tournament by creating a team
    results/[id].tsx       — tournament groups / bracket / results
  skills.tsx               — editable player skills
  player-information.tsx   — player attributes
  user-matches.tsx         — matches the current user has joined
  about-us.tsx             — app info

services/
  api.ts                   — axios instance with JWT interceptor + 401 handler
  authService.ts           — login / register (own axios client, AUTH_BASE_URL)
  matchesService.ts        — matches CRUD + filters + events
  tournamentsService.ts    — tournaments, teams, locations, preview
  locationsService.ts      — getLocations (available locations)
  playerSkillsService.ts   — player skill attributes
  usersService.ts          — getMe / user profile

store/
  authStore.ts             — Zustand: token, userId, roles, signIn/out, initialize, isAdmin()
  langStore.ts             — Zustand: lang, t, initialize, setLang
  themeStore.ts            — Zustand: colors palette, theme toggle, initialize

i18n/
  index.ts                 — Lang type + Translations type + translations map
  es_es.ts                 — Spanish strings
  cat_es.ts                — Catalan strings

types/                     — one numeric enum per file, values mirror C# enums
  footballType.ts · matchStatus.ts · sportType.ts · tournamentStatus.ts
  tournamentPhase.ts · position.ts · preferredFoot.ts · skillLevel.ts
  playerSpeed.ts · role.ts

constants/
  colors.ts                — base color palette
  env.ts                   — AUTH_BASE_URL / API_BASE_URL resolution (isDebug toggle)
  match.ts                 — sport-type + status label/config maps

components/
  MatchCard.tsx · MatchCardSkeleton.tsx · MatchFilters.tsx
  DetailRow.tsx · Toast.tsx · LoadingScreen.tsx
  BirthdayPicker.tsx · TimePicker.tsx · DateTimePickerField.tsx · DurationPicker.tsx

utils/
  formatDate.ts
  makeStyles.ts            — theme-aware StyleSheet factory (colors injected)
```

## Key conventions

- **UI text** — always use `const t = useLangStore((s) => s.t)` and `t.someKey`. Never hardcode user-visible strings. Add new keys to both `es_es.ts` and `cat_es.ts`.
- **Colors** — never hardcode hex. Read the palette from `useThemeStore((s) => s.colors)` and consume via the `makeStyles((colors) => …)` factory so styles stay theme-aware.
- **Services** — live in `services/`, contain no UI code, are async. Screens call services, never raw fetch/axios directly.
- **API client** — use `apiClient` from `services/api.ts` for authenticated requests (`API_BASE_URL`). Auth endpoints use their own client in `authService.ts` (`AUTH_BASE_URL`).
- **State** — Zustand stores in `store/`. Do not use React Context for global state.
- **Reuse before duplicating** — before writing a helper, label map, picker, or config object, check `constants/`, `utils/`, and `components/` first.
- **Enums** — numeric TypeScript enums in `types/`, one per file. Values must match the C# enum defaults (0, 1, 2…). The API sends and receives integers, not strings — there is no `JsonStringEnumConverter` on the backend.
- **Safe area** — screens use `SafeAreaView` from `react-native-safe-area-context`.
- **Stack screens** — set `headerShown: false` in `app/_layout.tsx` and implement a custom navbar with a back arrow.
- **Admin-only UI** — gate with `useAuthStore((s) => s.isAdmin())`.
- **TypeScript strict mode** is enabled.

## API base URLs

Both base URLs are resolved centrally in `constants/env.ts` via the `isDebug` flag:
- **LoPartidet API** — `API_BASE_URL` (local `http://localhost:10004`, prod `https://api.lopartidet.cat`)
- **Identity/Auth API** — `AUTH_BASE_URL` (local `http://localhost:10002`, prod `https://identity.lopartidet.cat`)

Toggle `isDebug` in `constants/env.ts` to switch local ↔ production. For an Android device/emulator, swap the local URL for the LAN IP variant (commented in `env.ts`).

## Running the app

```bash
npx expo start
```
