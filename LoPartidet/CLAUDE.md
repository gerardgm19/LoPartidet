# LoPartidet

Expo Router (v6) app built with React Native.

## Project language
English only — all code, file names, and comments must be in English.
UI text is handled via the i18n system — never hardcode user-facing strings.

## Structure

```
app/
  _layout.tsx              — root Stack + SafeAreaProvider + auth guard
  index.tsx                — redirects to (tabs)/matches or (auth)/login
  (auth)/
    _layout.tsx            — Stack for auth screens (no header)
    login.tsx
    register.tsx
  (tabs)/
    _layout.tsx            — bottom tab navigator (Matches, Profile)
    matches.tsx
    profile.tsx
  match/[id].tsx           — match detail screen
  player-details.tsx       — editable player attributes (position, foot, skill, speed, jersey, height)
  settings.tsx             — user account info (name, surname, nickname, email, city, birthday)
  about-us.tsx             — app info

services/
  api.ts                   — axios instance with JWT interceptor + 401 handler
  authService.ts           — login / register (own axios client, separate port)
  matchesService.ts        — getMatches / getMatchById

store/
  authStore.ts             — Zustand store: token, userId, signIn, signOut, initialize
  langStore.ts             — Zustand store: lang, t, initialize, setLang

i18n/
  index.ts                 — Lang type + Translations type + translations map
  es_es.ts                 — Spanish strings
  cat_es.ts                — Catalan strings

types/
  footballType.ts          — FootballType numeric enum (Fut5=0, Fut7=1, Fut11=2, Futsal=3, Beach=4, Indoor=5)
  matchStatus.ts           — MatchStatus numeric enum (Scheduled=0, Live=1, Finished=2)

constants/
  colors.ts                — Colors palette (always use Colors.*, never hardcode hex)
  match.ts                 — FOOTBALL_TYPE_LABEL map + STATUS_CONFIG map

components/
  MatchCard.tsx
  DetailRow.tsx
  Toast.tsx

utils/
  formatDate.ts

mocks/
  matches.mock.ts          — 5 mock matches (used during development)
```

## Key conventions

- **UI text** — always use `const t = useLangStore((s) => s.t)` and `t.someKey`. Never hardcode user-visible strings.
- **Colors** — always use `Colors.*` from `constants/colors.ts`. Never hardcode hex values.
- **Services** — live in `services/`, contain no UI code, are async. Screens call services, never raw fetch/axios directly.
- **API client** — use `apiClient` from `services/api.ts` for authenticated requests. Auth endpoints use their own client in `authService.ts`.
- **State** — Zustand stores in `store/`. Do not use React Context for global state.
- **Reuse before duplicating** — before writing a helper, label map, or config object, check `constants/` and `utils/` first.
- **Enums** — use numeric TypeScript enums in `types/`. Values must match the C# enum defaults (0, 1, 2…). The API sends and receives integers, not strings — there is no `JsonStringEnumConverter` on the backend.
- **One type per file** — each enum lives in its own file under `types/`.
- **Safe area** — all screens use `SafeAreaView` from `react-native-safe-area-context` with `edges={["top"]}`.
- **Stack screens** — set `headerShown: false` in `app/_layout.tsx` and implement a custom navbar with a back arrow.
- **TypeScript strict mode** is enabled.

## API base URLs

Two services, two ports:
- **Matches API** — port `10004` (`matchesService.ts`)
- **Auth API** — port `10002` (`authService.ts`)

Android emulator routes `localhost` to `10.0.2.2`. Toggle `isDebug` in each service file to switch between local and production (`178.33.119.182`).

## Running the app

```bash
npx expo start
```
