# Wits Quest — Master Fixes & Outstanding Features Worklist

> **Document Purpose**: A single consolidated worklist of (a) everything in the codebase that needs to be fixed, and (b) the outstanding features selected from the **Basic** and **Intermediate** tiers of the official course brief (`wits_quest.pdf`, COMS3011A Project 6).
>
> **Sources**: `wits_quest.pdf` (official brief), `FEATURES_STATUS_AND_GAP_ANALYSIS.md`, `SPRINT2_FEATURE_SELECTION_AND_TASK_GUIDE.md`, `WITS_QUEST_FEATURE_HANDOVER_GUIDE.md`, plus a line-level audit of the current codebase. All file/line references below were verified against the working tree at the time of writing.

---

## Part 1 — All Things To Be Fixed (Master Fix List)

### 1.1 Game-Integrity & Server-Authority Fixes

_The brief's core principle: "trust nothing from the client" — location, answers, and match outcomes are all server-verified._

**F1. No server-side location verification on trivia attempts.**

- **Evidence**: The client sends only `{ triviaId, answer }` to `POST /api/trivia/answer` (`frontend/src/services/apiClient.ts:315-323`). No coordinates are transmitted, and the parallel `POST /api/events/:id/answer` (`backend/src/server.ts:279`) also receives no coordinates. The 25 m Haversine gate lives only in `MapExplorer.tsx` on the client.
- **Fix**: Attach `lat`, `lng`, `accuracy`, and `timestamp` to every attempt; server recomputes the Haversine distance against the event's `lat`/`lng`/`radius` and rejects out-of-range attempts before marking the answer.

**F2. Battle round resolution is client-side.**

- **Evidence**: `frontend/src/utils/battleEngine.ts` decides every round winner; `POST /api/battle/record` (`backend/src/routes/battle.ts:9`) persists whatever outcome the client declares.
- **Fix**: Add a server-side round-resolution endpoint, or have `/record` validate each entry of `roundsData` against the server-held deck (fetch the deck's cards, verify claimed stat values, recompute outcomes) before awarding XP/Essence/Elo.

**F3. `POST /api/events/:id/answer` trusts `userId` from the request body.**

- **Evidence**: `backend/src/server.ts:279-281` reads `userId` straight from `req.body` with no `authMiddleware` — anyone can answer trivia on behalf of any student.
- **Fix**: Delete this duplicate endpoint (the frontend uses the protected `/api/trivia/answer` flow anyway) or protect it and derive `userId` from the JWT.

**F4. Unprotected inline routes shadow the protected route-file versions.**

- **Evidence**: `backend/src/server.ts` registers inline handlers — `POST /api/cards` (line 45), `GET/POST /api/events` (150/158), `PUT/DELETE /api/events/:id` (183/202), `GET/POST /api/events/:id/trivia` (211/224), `POST /api/events/:id/answer` (279) — **before** mounting `contentRoutes` at line 364. Express matches in registration order, so the `authMiddleware`-protected `POST /api/cards` in `backend/src/routes/content.ts:11` is never reached; card creation is fully unauthenticated.
- **Fix**: Remove the inline duplicates from `server.ts`, keep the route-file versions, and audit every remaining inline route for missing middleware.

**F5. No ADMIN/LECTURER role guard anywhere in the backend.**

- **Evidence**: No `role` check exists in `server.ts` or any file under `backend/src/routes/` (verified by search). The frontend hides admin screens by role, but any authenticated student can call the authoring/CRUD APIs directly.
- **Fix**: Add a `requireAdmin` middleware (checks `users.role === 'ADMIN' | 'LECTURER'` after JWT verification) and apply it to all event/card/trivia authoring and telemetry-audit endpoints.

**F6. Repeat-answer farming.**

- **Evidence**: `POST /api/events/:id/answer` re-awards card quantity + XP + Essence on _every_ correct submission (`backend/src/server.ts:315-357`) — there is no once-per-event-per-player guard. The brief says a correct answer awards the card "once".
- **Fix**: Record attempts (an `event_attempts` table or the existing completed-events logic) and block repeat attempts for the same player/event; confirm the protected `/api/trivia/answer` path enforces the same rule once the duplicate endpoint is removed.

### 1.2 Security & Access-Control Fixes

**F7. Real credentials committed in `deployment/RENDER_DEPLOYMENT.md`.**

- **Evidence**: Lines 46-50 contain a plaintext Gmail app password and a JWT secret as example values.
- **Fix**: Rotate the Gmail app password and JWT secret immediately, strip the values from the document, and keep secrets only in environment variables / dashboard settings.

**F8. `.env.example` is gitignored.**

- **Evidence**: `.gitignore` line 4 excludes `.env.example` (and line 14's `.env*` matches it too) — environment templates are not versioned, so new cloners can't follow the documented setup.
- **Fix**: Remove `.env.example` from `.gitignore` (keep `.env`, `.env.local`, `.env.*.local` ignored) and commit the templates.

**F9. Email-verification and password-reset OTP codes are stored in in-memory arrays.**

- **Evidence**: Backend auth flow keeps codes in process memory (per audit of `routes/auth.ts` / `emailService.ts`) — lost on server restart, unusable across multiple instances.
- **Fix**: Persist codes to a table with expiry timestamps, or use signed, self-expiring tokens.

**F10. CORS allows all origins (Express and Socket.IO).**

- **Fix**: Restrict origins to the production frontend URL plus `localhost` in development.

**F11. `websocketClient.ts` hardcodes `http://localhost:3000`.**

- **Evidence**: `frontend/src/utils/websocketClient.ts:3`. Any deployed frontend cannot reach live battles.
- **Fix**: Read the socket URL from `VITE_API_URL` (env), falling back to localhost in dev.

**F12. `supabaseClient.ts` exits the process when credentials are missing.**

- **Fix**: Lazy-initialise the client and return graceful 503s on data routes instead of killing the server (which also kills `/api/health`).

### 1.3 Routing & Navigation Fixes

**F13. `DeckBuilder` can never render.**

- **Evidence**: `frontend/src/App.tsx:8` imports it and line 20 includes `'deck'` in the `Screen` union, but there is no `{screen === 'deck' && <DeckBuilder />}` block in the JSX — the screen is unreachable.
- **Fix**: Add the render block plus a navigation entry (see F15).

**F14. Six built screens are completely unrouted.**

- **Evidence**: `AsyncPvP.tsx`, `LivePvPArena.tsx`, `QuestTrails.tsx`, `Trades.tsx`, `CardForge.tsx`, `TerritoryMap.tsx` are not imported or switched on in `App.tsx`.
- **Fix**: Add each to the `Screen` union + render switch as its backing feature goes live.

**F15. `Profile`'s `onNavigate` prop is unused.**

- **Evidence**: `frontend/src/screens/Profile.tsx` receives `onNavigate` (passed at `App.tsx:113`) but never calls it — there is no hub to reach deck/leaderboard/ranked/etc.
- **Fix**: Implement the quick-access navigation grid (Sprint 2 Task 5.1): Deck Builder, Leaderboard, Ranked, Quest Trails, Card Forge, Trades.

**F16. `BottomNav` is capped at 5 player tabs and 3 admin tabs.**

- **Fix**: Add `CURATION` and `ANALYTICS` tabs when those screens exist; consider making the player nav extensible/scrollable.

**F17. `alert("Multiplayer is coming soon!")` blocks the multiplayer hub.**

- **Evidence**: `frontend/src/screens/BattleArena.tsx:338`.
- **Fix**: Replace with real navigation to CPU / Async PvP / Live PvP choices (Sprint 2 Task 2.1).

### 1.4 Static Screens → Live-Data Fixes

**F18. Leaderboard is hardcoded.**

- **Evidence**: `frontend/src/screens/Leaderboard.tsx:4` defines `DEFAULT_PLAYERS`; no call to `GET /api/users` exists in the file.
- **Fix**: Fetch live users, sort by `totalXP`/`eloRating`, render division badges and streaks.

**F19. `RankedMatchmaking` shows a mock ladder** — wire to real player data + a matchmaking queue (see Intermediate I-3/deferred Advanced work).

**F20. `CardForge` is a static dummy UI** — needs the backend scrap/upgrade endpoints and the player's real duplicates (Fix F40).

**F21. `QuestTrails` is a hardcoded mock** — needs the full feature (Intermediate I-6).

**F22. `Trades` computes stat fairness client-side only** — needs a backend atomic-exchange endpoint (Advanced tier — defer).

**F23. `TerritoryMap` renders hardcoded SVG percentages** — needs precinct/faction persistence (Advanced tier — defer).

**F24. `LivePvPArena` uses hardcoded `PLAYER_CARDS`/`OPPONENT_CARDS`** — needs the real saved deck + Socket.IO hookup (Advanced tier — defer, but blocked on F11 too).

**F25. Locked cards are hidden from the collection.**

- **Evidence**: `frontend/src/screens/CardCollection.tsx:353` — `setEntries(full.filter((e) => e.unlocked))`. The brief expects players to browse and see what is still to collect; the `CardTile` component already renders a locked style (lines 29-63).
- **Fix**: Remove the filter so locked cards remain, rendered dimmed with "Walk to X to unlock" hints.

### 1.5 Backend Correctness & Consistency Fixes

**F26. Division-tier thresholds are inconsistent.**

- **Evidence**: `backend/src/routes/battle.ts:77-78` uses `DIAMOND >= 2000`, `PLATINUM >= 1500`; `backend/src/services/mockDb.ts` (`calculateDivisionTier`) uses `DIAMOND >= 1800`; the database plan and schema docs say Diamond is 1800+.
- **Fix**: Pick one source of truth (documented 1800+), centralise the calculation in a shared helper, and use it from both paths.

**F27. Trivia XP never levels the player up.**

- **Evidence**: `POST /api/events/:id/answer` adds `currentXP`/`totalXP` (`backend/src/server.ts:347-358`) with no level-up loop, while `battle.ts` promotes levels with `while (currentXP >= level * 200)`.
- **Fix**: Extract a shared `applyXpAndLevel()` helper and use it in every XP-awarding path (battle, trivia, events, trails). Verify the protected `/api/trivia/answer` path also runs it.

**F28. Daily-streak fields are written at registration and never again.**

- **Evidence**: No route updates `lastCheckInDate`, `dailyStreakCount`, or `streakMultiplier` on check-in.
- **Fix**: On the first _verified_ check-in of each day, compare against `lastCheckInDate`: increment the streak within 24 h, reset beyond 48 h, and store the multiplier (1.0 / 1.10 @ 3d / 1.25 @ 7d).

**F29. Trivia answer column mismatch: `correctAnswer` vs `correctIndex`.**

- **Evidence**: `server.ts:252,255` writes `correctAnswer` and `server.ts:300` reads `correctAnswer`, but the documented schema (`docs/database/database-schema.md`) and the migration SQL (`personal/supabase_migration_guide.md`) define `correctIndex`. A table created from the migration SQL breaks MC questions silently.
- **Fix**: Align the column name across code, migration SQL, and docs.

**F30. `mockDb` fallback is not wired — Supabase outages crash auth.**

- **Evidence**: Sprint 2 Task 3.1 documents the root cause (`ENOTFOUND` from Supabase crashes `POST /api/auth/register`); `mockDb.ts` exists but is only used by tests.
- **Fix**: Wrap Supabase calls in try/catch; fall back to `mockDb` (or return clear 503s) when Supabase is unreachable; ensure starter cards + deck are seeded either way.

**F31. Two overlapping battle-result endpoints.**

- **Evidence**: `POST /api/battle/record` and `POST /api/battle/result` both compute XP/Essence/Elo awards.
- **Fix**: Consolidate to one implementation.

**F32. `backend/scratch_server.ts` is dead code with broken imports** (references non-existent `initDB`/`createTables`). **Fix**: delete it.

**F33. Backend depends on itself via `"wits-quest-root": "file:.."`** (`backend/package.json`). **Fix**: remove the dependency and reinstall.

**F34. Campus landmark list is duplicated.**

- **Evidence**: `frontend/src/utils/antiCheat.ts:73-96` re-declares `CAMPUS_LANDMARKS` with a TODO to share it with `MapExplorer.tsx`.
- **Fix**: Export `LANDMARKS` from one module (e.g. `mapdata/`) and import it everywhere.

### 1.6 Anti-Cheat Fixes

**F35. All spoof detection is client-side; the server only stores pings.**

- **Evidence**: `antiCheat.ts` computes speed/teleport violations in the browser; the backend's `telemetry.ts` persists `telemetry_pings` but never evaluates them.
- **Fix**: On ping ingestion, compute Haversine distance/velocity server-side against the previous ping (thresholds: > 15 m/s speed; ≥ 200 m within ≤ 5 s teleport) and persist violations.

**F36. Violations don't gate anything.**

- **Fix**: When a trivia attempt arrives (F1), check the player's recent violations and reject attempts made from flagged movement sessions.

**F37. No low-accuracy GPS handling.**

- **Fix**: The brief requires that a fix "too poor to rely on" needs corroboration — require `accuracy` below a threshold or a second corroborating ping before trusting a check-in.

_(Trust scoring, duplicate-submission detection, and account-pairing analysis are Advanced tier — deferred.)_

### 1.7 Progression & Economy Fixes

**F38. Streak multipliers are stored but never applied.**

- **Fix**: Apply `streakMultiplier` inside the shared XP helper (F27) to trivia and battle rewards.

**F39. Achievements are entirely missing** (Intermediate tier).

- **Fix**: Add an `achievements` + `user_achievements` schema, award logic on check-ins/battles/streaks, and a Profile display section.

**F40. Card Forge backend is missing.**

- **Fix**: Implement scrap (duplicate → Essence) and upgrade (2 duplicates + 100 Essence → +5 ATK/DEF/SPD/BRN) endpoints, then wire `CardForge.tsx` (F20).

**F41. Stat-budget scaling may not run on the Supabase path.**

- **Evidence**: `mockDb.recordBattleResult` scales `maxStatBudget` (300 → 350 @ Lv.10 → 400 @ Lv.20); verify the Supabase update in `battle.ts` does the same.
- **Fix**: Move the scaling into the shared progression helper so both paths match.

### 1.8 Offline Fixes

**F42. The offline queue is written but nothing ever enqueues.**

- **Evidence**: `offlineQueue.ts` implements enqueue/dequeue/`processQueue`, and `main.tsx:13-53` listens for reconnects — but `TriviaModal.tsx` contains no `navigator.onLine` / offlineQueue usage (verified: zero matches).
- **Fix**: In `TriviaModal`, when `!navigator.onLine`, store the attempt via `enqueueCheckIn()` **with the coordinates and timestamp captured at attempt time** (so the server can validate "as it would have been at the time" — ties into F1); show an "Offline Mode Active — answers will sync when reconnected" badge; `processQueue` then replays via `POST /api/trivia/checkin` on reconnect.

**F43. Service-worker API caching needs review once offline play is live** — ensure stale questions/answers are never served from cache during an offline attempt.

### 1.9 CI/CD & Repository-Hygiene Fixes

**F44. README references workflows that don't exist.**

- **Evidence**: README's file structure lists `.gitea/workflows/ci.yml` and `.github/workflows/docs.yml`; only `.github/workflows/ci.yml` exists (docs deploy is a job inside it).
- **Fix**: Create the Gitea workflow (Sprint 2 Task 7.1) and/or correct the README.

**F45. Production deploys trigger from a personal branch.**

- **Evidence**: `.github/workflows/ci.yml:89,136` deploys docs + Vercel on pushes to `mahlatse_task2` **or** `main`.
- **Fix**: Restrict deploys to `main` (or explicit tags) so no member's WIP branch ships production.

**F46. `deployment/docker-compose.yml` references a missing `deployment/Dockerfile`.**

- **Fix**: Add the Dockerfile or delete the compose file.

**F47. The backend is not deployed anywhere.**

- **Evidence**: `render.yaml` and the Render guide exist but were never executed; the live Vercel frontend therefore has no API to talk to (and `websocketClient.ts` points at localhost — F11).
- **Fix**: Deploy the backend (Render), set `VITE_API_URL` on Vercel, and point the socket client at the deployed URL.

**F48. README links to a non-existent file.**

- **Evidence**: Links to `personal/ci_cd_testing_battle_ai_anticheat_guide.md`; the actual file is `personal/testing_and_ci_cd_plan.md`.
- **Fix**: Correct the link.

### 1.10 Documentation Fixes

**F49. Unresolved Git merge-conflict markers committed in `WITS_QUEST_FEATURE_HANDOVER_GUIDE.md`.**

- **Evidence**: Lines 120-126 contain `<<<<<<< HEAD` / `=======` / `>>>>>>> ddc5bd7…` around the Member 5/6 name rows (Nontokozo/Keoratile vs Nontobeko/Kea).
- **Fix**: Resolve the names and remove the markers.

**F50. Division tiers are defined twice, differently.**

- **Evidence**: Database plan uses Elo ranges only; handover guide §1.6 adds Total-XP bands for the same divisions (and conflicts with F26's code thresholds).
- **Fix**: Reconcile to a single definition across docs and code.

**F51. Most UML diagrams are still scaffolds.**

- **Evidence**: Use-case (03), battle state machine (02), and ERD (04) are authored; use-case/class/sequence/activity pages under `docs/uml/` are placeholders.
- **Fix**: Author the remaining diagrams (course deliverable risk).

**F52. Meeting records for 2026-08-06 and 2026-08-13 are empty templates** (`docs/meetings/index.md`). **Fix**: backfill or remove.

**F53. Two competing design systems are documented.**

- **Evidence**: README describes the parchment "Wits Adventure Scroll" palette; `ai/UI_DESIGN_SYSTEM.md` and the current `variables.css` use a navy/anime-realism palette.
- **Fix**: Pick one, align the CSS tokens and docs.

---

## Part 2 — Outstanding Features Selected from the PDF (Basic + Intermediate)

The brief stages delivery in three tiers. Per the gap analysis the codebase sits at ~85% Basic, ~35% Intermediate, ~15% Advanced. The selected work below covers **only Basic and Intermediate** — finishing these before touching Advanced.

### 2.1 Basic Tier (PDF §1.1.1) — outstanding items

|  #  | Brief requirement (PDF)                                                                                                                                                    | Current status                                                                                     | Outstanding work (fix refs)                                                                                                                                   |
| :-: | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| B-1 | Map of campus; player sees where they are and what's near; events active within a radius **and a time window**; tell at a glance which are in reach / too far / **passed** | Map, GPS, 25 m radius, and status pins work                                                        | Surface the **time window**: flag events as UPCOMING / ACTIVE / EXPIRED from `startDate`/`endDate` and render an explicit "passed" state in `MapExplorer.tsx` |
| B-2 | Device position is a **claim to be checked**, not fact — someone not at the location must not be able to attempt the challenge                                             | Client-side Haversine gate only                                                                    | **Server-side verification of coordinates on every attempt** (F1), plus violation gating (F36) — the single most important Basic gap                          |
| B-3 | Trivia drawn from alumni/history/landmarks; **varied formats**; marked by the game; player learns the answer either way                                                    | Done — MC + text, server-marked, answer always revealed                                            | Harden: remove/protect the duplicate answer endpoint (F3), un-shadow the protected routes (F4)                                                                |
| B-4 | Correct answer awards the event's card **once**; cards carry category + attributes; varying rarity; browse collection                                                      | Awarding works; rarity/categories work                                                             | Enforce **once-per-player-per-event** (F6); show locked cards with unlock hints instead of hiding them (F25)                                                  |
| B-5 | Choose a deck; turn-based match vs the computer; attribute compared round by round; **rules enforced by the game, not the player**; finished matches kept                  | Battle + match persistence work; but resolution is client-side and the Deck Builder is unreachable | Move/duplicate round resolution **server-side** (F2); mount `DeckBuilder` in `App.tsx` (F13) and link it from Profile (F15)                                   |
| B-6 | Authors' console: place events, write questions/answers, define cards and attributes                                                                                       | `AdminEvents` + `AdminContent` functional                                                          | Add auth + **admin role guard** to all authoring endpoints (F4, F5); curation workflow is Intermediate (I-7)                                                  |

### 2.2 Intermediate Tier (PDF §1.1.2) — outstanding features

|  #  | Brief requirement (PDF)                                                                                                                                                | Current status                                                                                                                                                          | Outstanding work (fix refs)                                                                                                                                                                                                                                                            |
| :-: | :--------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I-1 | **Offline play** — a player with no signal can still answer a reached event; attempt held on device and checked later as it would have been at the time                | Queue service + reconnect listeners exist; nothing enqueues                                                                                                             | Wire `enqueueCheckIn()` into `TriviaModal` with captured coords/timestamp, offline badge, replay via `/api/trivia/checkin` (F42, F43); server must validate using the _captured-time_ position (F1)                                                                                    |
| I-2 | **Harder location checks** — movement history, journeys nobody could walk, attempts faster than the walk allows, fixes too poor to rely on                             | Detection is client-side only; server passively stores pings                                                                                                            | Server-side velocity/teleport evaluation on ping ingestion (F35); gate attempts on violations (F36); accuracy corroboration (F37)                                                                                                                                                      |
| I-3 | **Async PvP** — challenge another player, each turn when it suits them, game holds the match in between, abandonment eventually forfeits                               | Not implemented — `AsyncPvP.tsx` is a static mock; no endpoints (the `async_pvp_challenges` table exists in the migration SQL and `mockDb.createAsyncChallenge` exists) | Build `POST /api/battle/async/challenge`, `GET /api/battle/async/my-matches`, `POST /api/battle/async/play-turn`; expire/forfeit on `expiresAt` (24 h); store `defenderTelemetry` (failed stat + deficit) on completion; route `AsyncPvP.tsx` (F14) and link from the battle hub (F17) |
| I-4 | **Retention** — profile, points, achievements, days kept up in a row, standings against everyone                                                                       | Profile/XP partial; leaderboard hardcoded; streaks never evaluated; no achievements                                                                                     | Live leaderboard from `GET /api/users` (F18); streak evaluation + multipliers on first daily check-in (F28, F38); achievements schema + awarding + display (F39)                                                                                                                       |
| I-5 | **Card depth** — rarer cards, duplicates that are worth something, decks assembled under constraints                                                                   | Rarity + deck-constraint validation built; duplicates are dead weight; Deck Builder unreachable                                                                         | Mount Deck Builder (F13); implement scrap + upgrade endpoints and wire `CardForge.tsx` (F20, F40); route CardForge (F14)                                                                                                                                                               |
| I-6 | **Quest trails** — events joined up and completed in order; game points to what's nearby and still unvisited                                                           | Not implemented — `QuestTrails.tsx` is a hardcoded mock                                                                                                                 | New `quest_trails` + `user_trail_progress` tables; endpoints for trail fetch/progress/next-stop; wire `QuestTrails.tsx` (F14, F21); surface unvisited nearby stops on the map                                                                                                          |
| I-7 | **Curation** — content drafted, reviewed, published (not live as written); campaigns scheduled; old events retired; questions everybody gets wrong surfaced for repair | Not implemented — `AdminCuration.tsx` doesn't exist; admin publishes directly to Supabase                                                                               | Content `status` lifecycle (`draft → pending_review → published → retired`); build `AdminCuration.tsx` review board + nav tab (F16); enforce campaign `startDate`/`endDate`; track per-question pass/fail counts and surface frequently-missed questions for repair                    |

### 2.3 Deliberately deferred (Advanced tier, PDF §1.1.3)

Not selected for this worklist: live WebSocket arena hookup (F24), adaptive trust scoring, procedural event placement, ranked seasons/queue (F19), territory control (F23), P2P trading with atomic exchange (F22), and the analytics console. These stay parked until Basic + Intermediate are complete.

---

## Part 3 — Recommended Execution Order

|              Phase               | Work items                                                                                                       | Why first                                                                                                             |
| :------------------------------: | :--------------------------------------------------------------------------------------------------------------- | :-------------------------------------------------------------------------------------------------------------------- |
|     **1. Security stopgaps**     | F7 (rotate leaked creds), F4 + F5 (protect routes, add admin guard), F3                                          | Cheap, fast, and closes the biggest integrity holes before more players use the system                                |
|  **2. Finish Basic integrity**   | F1 (server-side location verify), F6 (award once), F2 (server-side battle rules), B-1 (event time-window states) | Completes the Basic tier as the brief defines it — everything else builds on trustworthy check-ins                    |
| **3. Make built work reachable** | F13, F15, F17, F25                                                                                               | Deck Builder, locked-card hints, and the battle hub are already built — routing fixes unlock them with minimal effort |
|  **4. Intermediate resilience**  | F42 + F43 (offline), F35-F37 (server-side anti-spoofing)                                                         | Both harden the same check-in path and depend on F1's coordinate submission                                           |
|    **5. Progression wiring**     | F26-F28, F38, F41, F18, F39                                                                                      | Shared XP/level/streak helper + live leaderboard + achievements — makes retention real                                |
|         **6. Async PvP**         | I-3 full stack                                                                                                   | Highest-value Intermediate feature; mock DB + schema groundwork already exist                                         |
|     **7. Economy + trails**      | F40 + F20 (Forge), I-6 (Quest Trails)                                                                            | Depends on duplicates being meaningful (Phase 5) and map surfacing (Phase 3)                                          |
|         **8. Curation**          | I-7                                                                                                              | Last Intermediate item; benefits from question pass/fail telemetry built in Phase 5                                   |
|    **9. Continuous hygiene**     | F8, F10-F12, F30-F34, F44-F53                                                                                    | Fold in alongside every phase; repo/docs/CI cleanup keeps the course deliverables clean                               |

---

_This worklist supersedes the roadmap section of `FEATURES_STATUS_AND_GAP_ANALYSIS.md` for execution purposes; update both as items land._
