# Wits Quest — Feature Implementation Status & Gap Analysis

**Document Purpose**: This document provides a comprehensive technical audit of the current Wits Quest codebase against the main project plan, the official course brief requirements (COMS3011A Project 6: Basic, Intermediate, and Advanced tiers), the Sprint 1 specifications, and the Team Member Handover Guide. It highlights what is fully implemented, what is partially implemented (mock/stubs/unwired), what is missing, and provides a prioritized roadmap of changes needed.

---

## 1. Executive Summary

| Category                      |        Status        | Details                                                                                                                                                                                                                                                                           |
| :---------------------------- | :------------------: | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Basic Tier (Brief)**        |  **~85% Complete**   | Core gameplay works: Map with GPS & Haversine formula, location-gated trivia with server-side validation, card unlocks, AI card battles with persistence, event & card authoring console.                                                                                         |
| **Intermediate Tier (Brief)** |  **~35% Complete**   | Offline queue service exists in IndexedDB but is not wired into gameplay; Anti-cheat velocity checking exists; Deck constraints are built; Profile, levels, and leaderboard exist; Curation board, quest trails, async PvP, and duplicate card forge are missing or static stubs. |
| **Advanced Tier (Brief)**     |  **~15% Complete**   | Basic WebSocket socket handler exists on backend; Elo and Division Tiers are stored; Live PvP, Ranked Matchmaking, Territory Control, Trading, Adaptive Trust Scoring, Procedural Placement, and Analytics Console are either static UI mocks or missing entirely.                |
| **Architecture & Database**   | **Solid Foundation** | Monorepo setup with React 18 TypeScript frontend and Express TypeScript backend. Migrated from mock in-memory DB to Supabase PostgreSQL with JWT auth and email OTP verification.                                                                                                 |

---

## 2. Three-Tier Course Brief vs. Current Implementation

### 2.1 Tier 1: Basic Requirements

| Requirement               | Plan Specification                                                                                                                         | Current Implementation Status                                                         | Gap / Required Changes                                                                                                                                                                                                      |
| :------------------------ | :----------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------ | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Campus Map**            | Player sees own GPS position and nearby campus landmarks/events on Wits Main Campus.                                                       | **DONE** (`MapExplorer.tsx`)                                                          | Leaflet map with custom scroll frame, Wits center marker, user GPS watch, and event pins.                                                                                                                                   |
| **Events**                | Fixed locations, active radius, active time window, visual indicator of in-reach vs out-of-reach.                                          | **DONE** (`MapExplorer.tsx`, backend `/api/events`)                                   | 25m radius check, pulse animations, locked vs unlocked pins, distance calculation.                                                                                                                                          |
| **Location Verification** | Device reported position is a claim, verified before trivia event challenge unlocks.                                                       | **PARTIALLY DONE**                                                                    | Distance check ($d \le 25\text{m}$) enables button on client. **Gap**: Backend does not verify coordinates upon answer submission; client sends coordinates only as telemetry pings.                                        |
| **Trivia Engine**         | Varied formats (Multiple Choice & Text input), answers marked server-side, awards card + XP, reveals correct answer regardless of outcome. | **DONE** (`TriviaModal.tsx`, backend `/api/trivia/answer` & `/api/events/:id/answer`) | Server validates answers, prevents duplicate attempts, awards cards/XP/Essence, and always reveals correct answer.                                                                                                          |
| **Cards & Inventory**     | Correct answer awards card; cards have categories, attributes (ATK, DEF, SPD, BRN), rarity; collection browser.                            | **PARTIALLY DONE** (`CardCollection.tsx`, backend `/api/users/:id/cards`)             | Cards and inventories work. **Gap**: `CardCollection.tsx` (line 353) filters out locked cards (`filter(e => e.unlocked)`), hiding locked landmark discovery hints from students.                                            |
| **Battles (CPU)**         | Turn-based match against CPU, choosing attributes, round-by-round comparison. Rules enforced server-side. Persisted finished matches.      | **PARTIALLY DONE** (`BattleArena.tsx`, backend `/api/battle/record`)                  | 5-round Best-of-5 combat against Kudu Computer bot works with persistence to `battle_matches`. **Gap**: Round-by-round attribute resolution is currently evaluated client-side in `battleEngine.ts` instead of server-side. |
| **Authoring Console**     | Place events on map, write questions/answers, define cards and attribute stats.                                                            | **DONE** (`AdminEvents.tsx`, `AdminContent.tsx`)                                      | Allows placing events, authoring MC/Text questions, and creating cards with image upload to Supabase storage.                                                                                                               |

---

### 2.2 Tier 2: Intermediate Requirements

| Requirement                         | Plan Specification                                                                                                                                                    | Current Implementation Status                                                          | Gap / Required Changes                                                                                                                                                                                                           |
| :---------------------------------- | :-------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Offline Play**                    | Explore, reach event, answer trivia offline. Attempt queued in IndexedDB and synced to server when connectivity returns.                                              | **PARTIALLY DONE** (`offlineQueue.ts`)                                                 | IndexedDB queue service (`wits_quest_offline`) is written with enqueue/dequeue logic. **Gap**: Not integrated into `MapExplorer.tsx` or `TriviaModal.tsx`. If network drops, fetch fails without falling back to queue.          |
| **Stronger Location Anti-Spoofing** | Movement history evaluation, flagging impossible walking speeds ($> 15\text{ m/s}$), teleport alerts ($> 500\text{m}$ in $< 30\text{s}$), low-accuracy GPS rejection. | **PARTIALLY DONE** (`antiCheat.ts`, `AdminAntiCheat.tsx`, `/api/mock/telemetry/pings`) | Anti-cheat utility detects speed violations and teleports. Admin console displays flagged logs. **Gap**: Telemetry checks are passive logging; violations do not actively gate trivia attempts or invalidate fraudulent matches. |
| **Async PvP**                       | Players challenge each other, take turns on own schedule, match state stored in DB, forfeit on timeout.                                                               | **NOT IMPLEMENTED** (`AsyncPvP.tsx`)                                                   | `AsyncPvP.tsx` exists only as a static mock UI with hardcoded matches. **Gap**: No backend endpoints (`/api/async-pvp`), no `async_matches` table, and screen is not linked in navigation.                                       |
| **Retention Systems**               | Profile, XP leveling curve, daily streaks with multipliers, campus-wide standings, achievements.                                                                      | **PARTIALLY DONE** (`Profile.tsx`, `Leaderboard.tsx`)                                  | Profile shows level, XP bar, essence, and streak. **Gap**: Daily streak does not auto-evaluate daily logins/check-ins; achievements system is missing; `Leaderboard.tsx` uses hardcoded data instead of live DB query.           |
| **Card Depth & Constraints**        | Rarity tiers, meaningful duplicates (scrapping/upgrading), deck built under constraints (5 cards, 300 stat cap, 1 legendary cap).                                     | **PARTIALLY DONE** (`DeckBuilder.tsx`, `CardForge.tsx`, `deckService.ts`)              | Strict deck validation (5 cards, stat budget, legendary limit) works. **Gap**: `CardForge.tsx` is static dummy UI; duplicate card upgrading is not saved to backend; `DeckBuilder.tsx` is not wired into `App.tsx`.              |
| **Quest Trails**                    | Sequential chain of events in required order, surfacing unvisited nearby stops.                                                                                       | **NOT IMPLEMENTED** (`QuestTrails.tsx`)                                                | `QuestTrails.tsx` exists as a hardcoded static UI mockup. **Gap**: No DB schema (`quest_trails`, `user_trail_progress`), no trail validation API, not integrated with `MapExplorer.tsx`.                                         |
| **Content Curation**                | Draft $\to$ review $\to$ publish governance board, scheduled campaigns, retirement of old events, frequently-missed question telemetry.                               | **NOT IMPLEMENTED**                                                                    | `AdminCuration.tsx` does not exist. `AdminContent.tsx` publishes directly to Supabase. No review queue or question failure rate tracking.                                                                                        |

---

### 2.3 Tier 3: Advanced Requirements

| Requirement                             | Plan Specification                                                                                                                          | Current Implementation Status                | Gap / Required Changes                                                                                                                                                                                                                                        |
| :-------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------ | :------------------------------------------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Live PvP**                            | Simultaneous 2-player real-time matches, timed turns, server-authoritative state, reconnect support, spectating.                            | **PARTIALLY DONE (Backend Stub Only)**       | `battleSocketHandler.ts` implements basic room creation and secret turn picking via Socket.io. **Gap**: `LivePvPArena.tsx` is hardcoded dummy UI; `BattleArena.tsx` multiplayer button alerts _"Multiplayer is coming soon!"_; not connected to live sockets. |
| **Adaptive Anti-Cheat / Trust Scoring** | Per-player trust score built from impossible velocity, duplicate submissions, and suspicious account pairings; proportionate moderation.    | **PARTIALLY DONE** (`AdminAntiCheat.tsx`)    | Manual warning and suspension audit log works. **Gap**: No automated algorithmic trust scoring (0–100 scale), no duplicate submission detection, no account collusion tracking.                                                                               |
| **Procedural Event Placement**          | Automatic spatial distribution across walkable campus area, spaced apart, capped density, periodic rotation, avoid bare spots.              | **NOT IMPLEMENTED**                          | Events are created solely via manual admin placement in `AdminEvents.tsx`. No procedural generation algorithm.                                                                                                                                                |
| **Ranked Competitive Play**             | Player Elo ratings, skill-based matchmaking queue, division tiers (Bronze $\to$ Diamond), seasonal resets.                                  | **PARTIALLY DONE** (`RankedMatchmaking.tsx`) | User schema has `eloRating` and `divisionTier`. Elo updates on match victory. **Gap**: `RankedMatchmaking.tsx` is an isolated UI mockup with mock ladder; no active matchmaking queue or seasonal reset mechanism.                                            |
| **Territory Control**                   | Campus precincts (East, West, Health) contested by student factions, influence shifted by match wins, server-resolved outcomes.             | **NOT IMPLEMENTED** (`TerritoryMap.tsx`)     | `TerritoryMap.tsx` has SVG polygons with hardcoded percentage values. **Gap**: No database schema, no faction tracking on users, no link between battle victories and precinct influence.                                                                     |
| **P2P Card Trading**                    | Two-sided trade offers, atomic (all-or-nothing) swap transaction, stat fairness constraint ($\Delta \text{stats} \le 25$), transfer limits. | **NOT IMPLEMENTED** (`Trades.tsx`)           | `Trades.tsx` contains client UI and stat difference calculation. **Gap**: No database table, no trading API, no atomic transactional exchange in Supabase.                                                                                                    |
| **Analytics Console**                   | Location draw heatmaps, question drop/failure rates, card drop distribution monitoring.                                                     | **NOT IMPLEMENTED**                          | `AdminAnalytics.tsx` does not exist.                                                                                                                                                                                                                          |

---

## 3. Team Member Domain Ownership & Deliverable Audit

Referencing `WITS_QUEST_FEATURE_HANDOVER_GUIDE.md` and `docs/project/scope.md`:

### Member 1: Geolocation, GIS & Spatial Engine Lead

- **Assigned Modules**: `MapExplorer.tsx`, GPS Verification API, Landmark Proximity Engine.
- **Current Progress**: **85% Complete**. Map rendering, Haversine formula, event pins, unlock animations, and telemetry pings are implemented.
- **Remaining Work**:
  1. Render active nearby student player avatars on the GIS map canvas.
  2. Implement avatar tap popover with options: "Challenge to Live PvP", "Send Async Challenge", "Propose Trade".
  3. Wire offline fallback into map exploration.

### Member 2: Battle Engine, AI & Real-Time Multiplayer Lead

- **Assigned Modules**: `BattleArena.tsx`, `LivePvPArena.tsx`, `AsyncPvP.tsx`, `battleEngine.ts`, `battleAI.ts`.
- **Current Progress**: **50% Complete**. Turn-based CPU battle against Kudu Computer AI works with animations and match history logging.
- **Remaining Work**:
  1. Replace alert in `BattleArena.tsx` ("Multiplayer is coming soon!") with actual navigation to Live PvP and Async PvP.
  2. Connect `LivePvPArena.tsx` to the backend Socket.io handler (`battleSocketHandler.ts`).
  3. Connect `AsyncPvP.tsx` to a real backend REST API for creating and responding to turn-based challenges.
  4. Move combat round resolution to server-side authority.

### Member 3: Database Architecture, Offline Sync & Auth Lead

- **Assigned Modules**: `Login.tsx`, `EmailVerification.tsx`, Supabase DB, `server.ts`, `offlineQueue.ts`, JWT Auth.
- **Current Progress**: **80% Complete**. Custom JWT authentication, student `@students.wits.ac.za` validation, email OTP verification, password reset, and Supabase integration are working.
- **Remaining Work**:
  1. Wire `offlineQueue.ts` into `TriviaModal.tsx` and `MapExplorer.tsx` so students can answer trivia without network connectivity and sync upon reconnection.
  2. Implement database migrations/tables for missing features: `async_challenges`, `quest_trails`, `trades`, `territory_control`.

### Member 4: Admin Console, Curation & Telemetry Lead

- **Assigned Modules**: `AdminEvents.tsx`, `AdminContent.tsx`, `AdminCuration.tsx`, `AdminAntiCheat.tsx`, `AdminAnalytics.tsx`.
- **Current Progress**: **50% Complete**. `AdminEvents.tsx`, `AdminContent.tsx`, and `AdminAntiCheat.tsx` exist and are functional.
- **Remaining Work**:
  1. Build `AdminCuration.tsx` for draft review and publishing workflow.
  2. Build `AdminAnalytics.tsx` for location heatmaps and question failure analytics.
  3. Add curation/analytics tabs to Admin `BottomNav.tsx`.

### Member 5: Progression Engine, Economy Systems & Trails Lead

- **Assigned Modules**: `CardCollection.tsx`, `DeckBuilder.tsx`, `Leaderboard.tsx`, `QuestTrails.tsx`, `Trades.tsx`, `CardForge.tsx`.
- **Current Progress**: **45% Complete**. Card collection, deck validation rules, and profile leveling exist.
- **Remaining Work**:
  1. Show locked landmark cards with discovery clues in `CardCollection.tsx` (fix line 353 filter).
  2. Mount `DeckBuilder.tsx` in `App.tsx` and add direct navigation in the app.
  3. Connect `Leaderboard.tsx` to live backend `/api/users` instead of hardcoded `DEFAULT_PLAYERS`.
  4. Implement backend and live data for `QuestTrails.tsx`, `Trades.tsx`, and `CardForge.tsx`.
  5. Implement daily check-in streak progression logic on login.

### Member 6: Advanced Anti-Cheat, Matchmaking & Territory Lead

- **Assigned Modules**: `TerritoryMap.tsx`, `RankedMatchmaking.tsx`, Velocity Trajectory Engine, Adaptive Trust Scoring.
- **Current Progress**: **35% Complete**. Basic speed/teleport calculations exist in `antiCheat.ts`; user schema tracks Elo and Division Tiers.
- **Remaining Work**:
  1. Implement automated Trust Score (0–100) on user profiles.
  2. Connect `RankedMatchmaking.tsx` to real player queue.
  3. Connect `TerritoryMap.tsx` to backend precinct control data influenced by battle outcomes.
  4. Implement movement trajectory validation on the backend.

---

## 4. UI/UX & Routing Architecture Issues

1. **Unmounted & Orphaned Screens**:
   - `DeckBuilder.tsx`: Imported in `App.tsx` and included in `type Screen = ... | 'deck'`, but completely omitted in the JSX screen switch block.
   - `AsyncPvP.tsx`: Not imported or routed anywhere in `App.tsx`.
   - `LivePvPArena.tsx`: Not imported or routed anywhere in `App.tsx`.
   - `QuestTrails.tsx`: Not imported or routed anywhere in `App.tsx`.
   - `Trades.tsx`: Not imported or routed anywhere in `App.tsx`.
   - `CardForge.tsx`: Not imported or routed anywhere in `App.tsx`.
   - `TerritoryMap.tsx`: Not imported or routed anywhere in `App.tsx`.

2. **Navigation Bar Bottleneck (`BottomNav.tsx`)**:
   - Player navigation is locked to 5 items (`map`, `collection`, `battle`, `history`, `profile`).
   - Features like `leaderboard`, `ranked`, `deck`, `trails`, `trades`, and `forge` have no navigation buttons.
   - `Profile.tsx` has an `onNavigate` prop that is completely unused in the component body. It should serve as a secondary menu hub (with buttons for Deck Builder, Leaderboard, Ranked Arena, Quest Trails, Card Forge, and Trades).

3. **Admin Navigation Incompleteness**:
   - `BottomNav.tsx` in Admin mode has 3 items (`events`, `content`, `anticheat`).
   - Missing links for `curation` and `analytics`.

---

## 5. Prioritized Action Plan & Roadmap

### Phase 1: High Priority (Fix Existing Sprint 1 Deliverables & Route Screens)

1. **Fix `App.tsx` Screen Switching**:
   - Mount `<DeckBuilder />` when `screen === 'deck'`.
   - Add routes or hub links for `leaderboard`, `ranked`, `trails`, `trades`, `forge`, `territory`, `async-pvp`, `live-pvp`.
2. **Add Navigation Hub to `Profile.tsx`**:
   - Add quick-access cards/buttons to navigate to Deck Builder, Leaderboard, Ranked Ladder, Quest Trails, Card Forge, and Trading.
3. **Fix Locked Cards in `CardCollection.tsx`**:
   - Modify line 353 so locked cards are retained in the list, rendering with dimmed styling and unlock hints as specified in the brief.
4. **Connect `Leaderboard.tsx` to Live API**:
   - Replace hardcoded `DEFAULT_PLAYERS` with a `getMockUsers()` / `/api/users` call so newly registered players and updated match stats appear dynamically.
5. **Connect `BattleArena.tsx` Multiplayer Option**:
   - Wire the "Async Multiplayer" card to navigate to `AsyncPvP` or `LivePvPArena` instead of displaying `alert()`.

### Phase 2: Medium Priority (Complete Intermediate Tier Features)

1. **Wire Offline Queue (`offlineQueue.ts`)**:
   - Update `MapExplorer.tsx` and `TriviaModal.tsx` to detect `navigator.onLine === false`, store check-ins in IndexedDB, and automatically replay them via `window.addEventListener('online')`.
2. **Implement Async PvP Backend & Persistence**:
   - Create Supabase table `async_challenges` (`id`, `challengerId`, `defenderId`, `challengerDeck`, `defenderDeck`, `rounds`, `currentTurn`, `status`, `expiresAt`).
   - Implement REST endpoints in backend: `POST /api/async-pvp/challenge`, `GET /api/async-pvp/my-matches`, `POST /api/async-pvp/turn`.
   - Connect `AsyncPvP.tsx` to these endpoints.
3. **Implement Daily Streak Progression**:
   - When a user submits their first verified trivia answer of the day, compare `lastCheckInDate` to current date. If consecutive, increment `dailyStreakCount`; if $> 48$h, reset to 1; update XP multipliers.
4. **Build Admin Curation Console (`AdminCuration.tsx`)**:
   - Implement review queue table for questions and cards (`status: 'draft' | 'pending_review' | 'published' | 'retired'`).
5. **Implement Card Scrapping & Forge in Backend**:
   - Allow students to break down duplicate cards for Essence shards and upgrade stats (+5 stats for 100 Essence + duplicate card).

### Phase 3: Advanced Tier Features

1. **Connect Live WebSocket Arena (`LivePvPArena.tsx`)**:
   - Connect frontend to `io(BACKEND_URL)` and emit `join_battle`, `submit_turn`, and listen for `round_outcome`.
2. **Implement Campus Territory Control**:
   - Create table `campus_territories` (East, West, Health sciences) and update faction percentages based on match results within precinct coordinates.
3. **Implement P2P Trading System**:
   - Create `trade_offers` table with atomic swapping of inventory records and enforcement of the $\le 25$ stat total fairness rule.
4. **Build Admin Analytics & Telemetry Dashboard (`AdminAnalytics.tsx`)**:
   - Visual heatmap of GPS pings, most/least visited campus events, question pass/fail percentages, and card drop rates.
