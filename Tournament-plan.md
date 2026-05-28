# Tournament Feature — Trello Task List

## Context

App currently single-match only. No roles, no scores, no teams, no brackets. Need: Admin creates tournament → teams register → groups round-robin → top N qualifiers advance to knockout → assigned Referee submits score + goal/assist/card events per match → bracket auto-advances → users follow standings & results in same app.

Locked decisions: single app role-gated (Player/Referee/Admin), auto-bracket from config, both teams + individual matches supported, results = score + events, Admin-only creation, round-robin groups (tiebreakers Points → GD → GF), per-match referee assignment.

Each `###` block below is one Trello card. Format: **List** · **Title** · **Description** · **Checklist** · **Depends on**.

---

## List: Backend — Foundations

### BE-01 · Add UserRole enum + Role on User
- **Desc:** Introduce roles so endpoints can be gated.
- **Checklist:**
  - [ ] `Models/UserRole.cs` enum `Player, Referee, Admin`
  - [ ] Add `Role` to `Entities/User.cs` (default `Player`)
  - [ ] EF migration `AddUserRole`
  - [ ] Update `UserDto` + `GET /users/me` to return role
- **Depends on:** none

### BE-02 · Role-based authorization
- **Desc:** Wire Role into the auth pipeline so `[Authorize(Policy=...)]` works.
- **Checklist:**
  - [ ] Extend `Authentication/RemoteJwtAuthHandler.cs` to load `Role` from local User row and add `ClaimTypes.Role` claim
  - [ ] Register `AdminOnly`, `RefereeOnly` policies in `Program.cs`
  - [ ] Smoke-test: non-admin hitting an admin endpoint returns 403
- **Depends on:** BE-01

### BE-03 · Admin endpoint to set user role
- **Desc:** Bootstrap referees/admins in production.
- **Checklist:**
  - [ ] `PATCH /users/{id}/role` (Admin policy)
  - [ ] `UpdateRoleDto`
  - [ ] Validator: cannot demote last admin
- **Depends on:** BE-02

---

## List: Backend — Tournament Domain

### BE-04 · Tournament entity + enums
- **Desc:** Core entity.
- **Checklist:**
  - [ ] `Entities/Tournament.cs` (Id, Name, SportType, Status, CreatedById, StartDate, GroupsCount, TeamsPerGroup, QualifiersPerGroup)
  - [ ] `Models/TournamentStatus.cs` (Draft, GroupStage, Knockout, Finished)
  - [ ] `Models/TournamentPhase.cs` (GroupStage, QuarterFinal, SemiFinal, Final)
  - [ ] DbSet + EF config in `LoPartidetContext`
- **Depends on:** none

### BE-05 · Team + TeamMember + TournamentGroup entities
- **Checklist:**
  - [ ] `Entities/Team.cs` (Id, Name, TournamentId, GroupId nullable)
  - [ ] `Entities/TeamMember.cs` composite PK (TeamId, UserId)
  - [ ] `Entities/TournamentGroup.cs` (Id, TournamentId, Name)
  - [ ] DbSets + relationships
- **Depends on:** BE-04

### BE-06 · Extend Match for tournaments + results
- **Desc:** Reuse Match; add nullable tournament/score fields so casual matches keep working.
- **Checklist:**
  - [ ] Add to `Match`: `TournamentId?`, `Phase?`, `GroupId?`, `TeamAId?`, `TeamBId?`, `RefereeId?`, `HomeScore?`, `AwayScore?`, `ResultSubmittedAt?`, `BracketSlot?`
  - [ ] FK config in `LoPartidetContext`
  - [ ] Migration
- **Depends on:** BE-05

### BE-07 · MatchEvent entity
- **Checklist:**
  - [ ] `Entities/MatchEvent.cs` (Id, MatchId, UserId, TeamId, Type, Minute)
  - [ ] `Models/MatchEventType.cs` (Goal, Assist, YellowCard, RedCard)
  - [ ] DbSet + relationships
- **Depends on:** BE-06

---

## List: Backend — Tournament Services

### BE-08 · StandingsCalculator
- **Desc:** Pure logic: given finished group matches → ranked rows.
- **Checklist:**
  - [ ] `Services/Interfaces/IStandingsCalculator.cs`
  - [ ] `Services/StandingsCalculator.cs` (Points=3W+1D, tiebreakers Points → GD → GF)
  - [ ] `Models/StandingRowDto.cs`
  - [ ] Unit-test the ordering on a fixture set
- **Depends on:** BE-07

### BE-09 · BracketGenerator
- **Desc:** Pure logic: seed knockout `Match` rows + BracketSlot wiring.
- **Checklist:**
  - [ ] `Services/Interfaces/IBracketGenerator.cs`
  - [ ] `Services/BracketGenerator.cs` (cross-bracket pairing: G1-1 vs G2-2, …)
  - [ ] Slot mapping table (QF1→SF1.A, QF2→SF1.B, …)
  - [ ] `Models/BracketDto.cs`
- **Depends on:** BE-08

### BE-10 · TournamentsService
- **Checklist:**
  - [ ] `Services/Interfaces/ITournamentsService.cs`
  - [ ] `Services/TournamentsService.cs` (Create, AddTeam, AssignTeamsToGroups, StartTournament, GetStandings, GetBracket, GetById, GetAll)
  - [ ] `StartTournament`: distribute teams → groups, generate round-robin matches (T·(T-1)/2 per group), status → `GroupStage`
  - [ ] Models: `CreateTournamentDto`, `TournamentDto`, `TeamDto`, `RegisterTeamDto`
  - [ ] Scoped registration in `Program.cs`
- **Depends on:** BE-09

### BE-11 · TournamentValidationService
- **Checklist:**
  - [ ] `Services/Validators/TournamentValidationService.cs` + interface
  - [ ] `ValidationResult` + request records per `cs-structure.md`
  - [ ] Rules: G×Q ∈ {2,4,8,16}, team count = G×T at start, no duplicate team names, referee must have Referee role
- **Depends on:** BE-10

### BE-12 · MatchResultsService + phase progression
- **Checklist:**
  - [ ] `Services/Interfaces/IMatchResultsService.cs`
  - [ ] `Services/MatchResultsService.cs` (SubmitResult, AddEvent)
  - [ ] After submit: if last group match → call `BracketGenerator`, flip to `Knockout`; if knockout → push winner into next-round `Match` by `BracketSlot`; if Final → status `Finished`
  - [ ] Models: `SubmitResultDto`, `MatchEventDto`
  - [ ] Validator: only assigned referee can submit; score not editable after Final
- **Depends on:** BE-09, BE-11

---

## List: Backend — Controllers

### BE-13 · TournamentsController
- **Checklist:**
  - [ ] `POST /tournaments` (AdminOnly)
  - [ ] `GET /tournaments`, `GET /tournaments/{id}`
  - [ ] `POST /tournaments/{id}/teams` (AdminOnly)
  - [ ] `POST /tournaments/{id}/start` (AdminOnly)
  - [ ] `GET /tournaments/{id}/standings`, `GET /tournaments/{id}/bracket`
  - [ ] Returns DTOs only
- **Depends on:** BE-10

### BE-14 · TeamsController
- **Checklist:**
  - [ ] `POST /teams/{id}/members`, `DELETE /teams/{id}/members/{userId}` (AdminOnly)
  - [ ] `PATCH /teams/{id}` rename/move group (AdminOnly)
- **Depends on:** BE-10

### BE-15 · MatchResultsController + referee assignment
- **Checklist:**
  - [ ] `PATCH /matches/{id}/referee` (AdminOnly)
  - [ ] `POST /matches/{id}/result` (assigned Referee)
  - [ ] `POST /matches/{id}/events` (assigned Referee)
  - [ ] Extend `GET /matches` filter `?refereeId=me` for the referee inbox
- **Depends on:** BE-12

---

## List: Frontend — Foundations

### FE-01 · Role in auth store
- **Checklist:**
  - [ ] Extend `store/authStore.ts` with `role`
  - [ ] Fetch from `GET /users/me` after login + on app start
  - [ ] `services/usersService.ts` returns role
- **Depends on:** BE-01

### FE-02 · Role-aware tab layout
- **Checklist:**
  - [ ] `app/(tabs)/_layout.tsx` shows extra **Tournaments** tab for all
  - [ ] **Referee** tab only when role = Referee
  - [ ] **Admin** tab only when role = Admin
- **Depends on:** FE-01

### FE-03 · Services scaffolding
- **Checklist:**
  - [ ] `services/tournamentsService.ts` (list, get, create, addTeam, start, standings, bracket)
  - [ ] `services/matchResultsService.ts` (submitResult, addEvent, assignReferee)
- **Depends on:** FE-01

---

## List: Frontend — User-facing tournament views

### FE-04 · Tournaments tab list
- **Checklist:**
  - [ ] `app/(tabs)/tournaments.tsx`
  - [ ] Card per tournament with status badge + sport
  - [ ] Pull-to-refresh
- **Depends on:** FE-03

### FE-05 · Tournament detail screen
- **Checklist:**
  - [ ] `app/tournament/[id].tsx`
  - [ ] Header (name, status, dates)
  - [ ] Standings table per group (sorted Pts → GD → GF, highlight qualifiers)
  - [ ] Matches list grouped by phase, links to `match/[id]`
- **Depends on:** FE-04

### FE-06 · Bracket visualization
- **Checklist:**
  - [ ] `app/tournament/[id]/bracket.tsx`
  - [ ] Columns QF / SF / Final, lines between
  - [ ] Show team names + scores when available; placeholders otherwise
- **Depends on:** FE-05

### FE-07 · Match detail tournament context
- **Checklist:**
  - [ ] Extend `app/match/[id].tsx`: show tournament name, phase, both teams, score (if submitted), event timeline
- **Depends on:** FE-05

---

## List: Frontend — Admin

### FE-08 · Admin tournament create
- **Checklist:**
  - [ ] `app/admin/tournament-create.tsx`
  - [ ] Form: name, sport, groups count, teams/group, qualifiers/group, start date
  - [ ] Validate G×Q ∈ {2,4,8,16}
- **Depends on:** FE-02, BE-13

### FE-09 · Admin tournament management
- **Checklist:**
  - [ ] `app/admin/tournament/[id]/teams.tsx`
  - [ ] Register teams + members (player picker)
  - [ ] Assign group per team
  - [ ] Assign referee per match (only users with Referee role)
  - [ ] "Start tournament" button (disabled until valid count)
- **Depends on:** FE-08, BE-14, BE-15

### FE-10 · Admin role management
- **Checklist:**
  - [ ] `app/admin/users.tsx` list users, change role
- **Depends on:** FE-02, BE-03

---

## List: Frontend — Referee

### FE-11 · Referee inbox
- **Checklist:**
  - [ ] `app/referee/index.tsx`
  - [ ] List of matches where `refereeId == me`, grouped by upcoming / live / finished
- **Depends on:** FE-02, BE-15

### FE-12 · Referee result entry
- **Checklist:**
  - [ ] `app/referee/result/[matchId].tsx`
  - [ ] Score input per team
  - [ ] Event list (Goal/Assist/YellowCard/RedCard) with player picker + minute
  - [ ] Submit → POST result + events, lock screen on success
- **Depends on:** FE-11

---

## List: QA / Verification

### QA-01 · Backend integration test pass
- **Checklist:**
  - [ ] `dotnet ef database update` clean
  - [ ] Seed Admin + Referee users
  - [ ] Admin creates tournament (G=2, T=4, Q=2) → 200
  - [ ] Register 8 teams → start → 12 group matches generated
  - [ ] Non-admin create → 403; non-assigned ref submit → 403
  - [ ] Submit all group results → standings ordered correctly, status flips to Knockout, 4 SF matches exist
  - [ ] Submit SF results → Final auto-populated; submit Final → status Finished

### QA-02 · Frontend end-to-end check
- **Checklist:**
  - [ ] `npx expo start` — Player sees Tournaments tab only
  - [ ] Referee sees Referee tab and assigned matches
  - [ ] Admin sees Admin tab, can create + manage tournament
  - [ ] Standings + bracket render and update after a result submission
  - [ ] Casual (non-tournament) match creation unaffected