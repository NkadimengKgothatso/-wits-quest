# Wits Quest — Sprint 2 Feature Guide & Team Task Selection Matrix

> **Document Purpose**: This guide is designed for the Wits Quest development team (COMS3011A Project 6). It breaks down all features across the **Basic**, **Intermediate**, and **Advanced** tiers, details the exact updates and polishing required for Sprint 2, and maps out actionable tasks so every team member can choose what to take on.

---

## 1. Sprint 2 Focus & Core Objectives

Following our Sprint 1 review and project requirements audit, the primary goals for **Sprint 2** are:

1. **Fix Broken Sign-Up & Auth Resilience**: Resolve cloud database connectivity issues with a reliable local fallback so registration works 100% of the time.
2. **Polish Basic Tier Deliverables**: Ensure 100% completion of map exploration, trivia grading, deck building, and AI combat persistence.
3. **Bring Intermediate Tier to Life**: Integrate offline queueing with IndexedDB, un-hide locked cards in the collection gallery, activate dynamic leaderboard rankings, and build async challenges.
4. **Elevate Code Quality & CI/CD**: Clean up linting errors, maintain $\ge 80\%$ test coverage, move CI/CD to Gitea Actions runners, and consolidate all documentation into MkDocs.

---

## 2. Team Task Selection Matrix

|   #   | Domain Area                                    | Recommended Lead         | Core Screens / Files                                                          |   Priority   | Difficulty |
| :---: | :--------------------------------------------- | :----------------------- | :---------------------------------------------------------------------------- | :----------: | :--------: |
| **1** | **Geolocation, GIS & Nearby Avatars**          | **Junior** (Member 1)    | `MapExplorer.tsx`, `apiClient.ts`                                             |   **HIGH**   |   Medium   |
| **2** | **Battle Engine, Live & Async Multiplayer**    | **Mahlatse** (Member 2)  | `BattleArena.tsx`, `LivePvPArena.tsx`, `AsyncPvP.tsx`                         | **CRITICAL** |    High    |
| **3** | **Auth Bug Fix, Offline Sync & Database**      | **Kgothatso** (Member 3) | `auth.ts`, `Login.tsx`, `offlineQueue.ts`, `mockDb.ts`                        | **CRITICAL** |    High    |
| **4** | **Admin Governance, Curation & Analytics**     | **Rea** (Member 4)       | `AdminCuration.tsx`, `AdminAnalytics.tsx`, `AdminContent.tsx`                 |  **MEDIUM**  |   Medium   |
| **5** | **Progression, Deck Builder, Trails & Forge**  | **Nontokozo** (Member 5) | `CardCollection.tsx`, `DeckBuilder.tsx`, `Leaderboard.tsx`, `QuestTrails.tsx` |   **HIGH**   |   Medium   |
| **6** | **Anti-Cheat Trust Score, Ranked & Territory** | **Keoratile** (Member 6) | `antiCheat.ts`, `RankedMatchmaking.tsx`, `TerritoryMap.tsx`                   |  **MEDIUM**  |    High    |

---

## 3. Detailed Domain Tasks & Implementation Guides

---

### Domain 1: Geolocation, GIS & Nearby Avatars

- **Assigned Lead**: **Junior** (Member 1)
- **Current Status**: Leaflet map renders campus with 25m radius unlocks and GPS telemetry pings.
- **What Needs to be Polished / Built**:

#### Task 1.1: Live Nearby Student Avatars on Map

- **Target File**: `frontend/src/screens/MapExplorer.tsx`
- **What to do**:
  1. Fetch active students via `getRegisteredStudentOpponents(currentUser.id)` from `apiClient.ts`.
  2. Place avatar markers at campus landmark coordinates or near the user's position.
  3. Render custom Leaflet `DivIcon` markers displaying student initials, avatar emojis, and online status badges.
- **Acceptance Criteria**: Other active students appear as pins/avatars on the Wits map.

#### Task 1.2: Nearby Player Challenge Interaction Modal

- **Target File**: `frontend/src/screens/MapExplorer.tsx`
- **What to do**:
  1. Clicking a student's map avatar opens a bottom sheet or popup dialog.
  2. Display the student's level, division tier, and Elo rating.
  3. Provide 3 action buttons:
     - **Challenge to Live Match**: Navigates to `LivePvPArena`.
     - **Send Async Challenge**: Sends a turn-based invite via `AsyncPvP`.
     - **Propose Card Trade**: Opens `Trades`.
- **Acceptance Criteria**: Clicking an avatar displays their profile and provides quick-action combat and trading triggers.

---

### Domain 2: Battle Engine, Live & Async Multiplayer

- **Assigned Lead**: **Mahlatse** (Member 2)
- **Current Status**: 5-round CPU Battle against Kudu Computer AI works with match history recording.
- **What Needs to be Polished / Built**:

#### Task 2.1: Remove "Coming Soon" Alert & Connect Battle Hub

- **Target File**: `frontend/src/screens/BattleArena.tsx` (Line 338)
- **What to do**:
  1. Remove `onClick={() => alert("Multiplayer is coming soon!")}`.
  2. Replace with a sub-navigation state allowing students to choose between:
     - **Kudu Computer Bot Duel** (CPU mode with Easy, Medium, Hard).
     - **Asynchronous Turn-Based Challenges** (`AsyncPvP`).
     - **Synchronous Real-Time WebSocket Duel** (`LivePvPArena`).
- **Acceptance Criteria**: Clicking multiplayer navigates to live or async battle screens without browser alerts.

#### Task 2.2: Live WebSocket Battle Connection

- **Target Files**: `frontend/src/screens/LivePvPArena.tsx`, `backend/src/services/battleSocketHandler.ts`
- **What to do**:
  1. Replace hardcoded mock arrays (`PLAYER_CARDS`, `OPPONENT_CARDS`) with user's actual saved deck.
  2. Connect to backend Socket.io: `socket.emit('join_battle', { matchId, userId, username })`.
  3. Emit `submit_turn` with the selected card attribute and listen for `round_outcome`.
  4. Display live round timer (15s) and spectator count.
- **Acceptance Criteria**: Two browser tabs can join the same match ID and play synchronous turns over WebSockets.

#### Task 2.3: Asynchronous PvP Backend & Match State

- **Target Files**: `backend/src/routes/battle.ts`, `frontend/src/screens/AsyncPvP.tsx`
- **What to do**:
  1. Create endpoints:
     - `POST /api/battle/async/challenge`: Send turn-based challenge with active deck.
     - `GET /api/battle/async/my-matches`: Fetch "Your Turn", "Waiting", and "Pending" matches.
     - `POST /api/battle/async/play-turn`: Lock in round attribute choice.
  2. Replace static arrays in `AsyncPvP.tsx` with live data fetched from these endpoints.
- **Acceptance Criteria**: Students can send a challenge, log off, and have the opponent take their turn later.

---

### Domain 3: Auth Bug Fix, Offline Sync & Database

- **Assigned Lead**: **Kgothatso** (Member 3)
- **Current Status**: JWT auth and email OTP exist, but sign-up is broken when Supabase is unreachable.
- **What Needs to be Polished / Built**:

#### Task 3.1: Fix Broken Sign-Up & Implement Resilient DB Fallback

- **Target Files**: `backend/src/routes/auth.ts`, `backend/src/db/supabaseClient.ts`, `backend/src/services/mockDb.ts`
- **Root Cause**: `https://kbazdskiqglyxsdvopsa.supabase.co` fails with `ENOTFOUND`, crashing `POST /api/auth/register` with `TypeError: fetch failed`.
- **What to do**:
  1. Wrap Supabase queries in `try/catch` blocks.
  2. If Supabase is unreachable (`fetch failed` or `ENOTFOUND`), automatically fall back to local `mockDb.ts` / SQLite so registration and login work seamlessly.
  3. Ensure default cards and starter deck are properly generated during registration.
  4. Ensure `@students.wits.ac.za` email regex accepts all valid student accounts.
- **Acceptance Criteria**: New students can register and immediately log in with zero 500 errors.

#### Task 3.2: Wire Offline Queue into Map & Trivia

- **Target Files**: `frontend/src/services/offlineQueue.ts`, `frontend/src/screens/TriviaModal.tsx`, `frontend/src/screens/MapExplorer.tsx`
- **What to do**:
  1. In `TriviaModal.tsx`, detect if `!navigator.onLine`.
  2. If offline, save the trivia attempt into IndexedDB using `enqueueCheckIn()`.
  3. Listen for `window.addEventListener('online')` to trigger `processQueue()` and synchronize saved attempts to the server when network connectivity is restored.
  4. Display an _"Offline Mode Active — Answers will sync when reconnected"_ badge.
- **Acceptance Criteria**: Disconnecting Wi-Fi allows answering reached trivia questions, and reconnecting syncs the earned cards.

---

### Domain 4: Admin Governance, Curation & Analytics

- **Assigned Lead**: **Rea** (Member 4)
- **Current Status**: `AdminEvents.tsx` and `AdminContent.tsx` allow direct publishing without moderation review.
- **What Needs to be Polished / Built**:

#### Task 4.1: Build Admin Curation Board (`AdminCuration.tsx`)

- **Target Files**: `frontend/src/screens/admin/AdminCuration.tsx` (NEW), `frontend/src/components/BottomNav.tsx`
- **What to do**:
  1. Create `AdminCuration.tsx` implementing a **Draft $\to$ Review $\to$ Published $\to$ Retired** workflow.
  2. Table displaying:
     - Submitted trivia questions and user-created cards.
     - Review actions: "Approve & Publish", "Request Revisions", "Retire Old Content".
  3. Add `CURATION` tab to Admin `BottomNav.tsx`.
- **Acceptance Criteria**: Authoring console saves content as "Draft/Pending", and admins approve it in `AdminCuration` before it goes live.

#### Task 4.2: Build Campus Heatmaps & Analytics Console (`AdminAnalytics.tsx`)

- **Target Files**: `frontend/src/screens/admin/AdminAnalytics.tsx` (NEW), `backend/src/routes/telemetry.ts`
- **What to do**:
  1. Fetch GPS pings from `/api/mock/telemetry/pings`.
  2. Render a campus activity distribution breakdown:
     - Most visited vs. under-visited campus landmarks.
     - Trivia question failure rates (surfacing questions that are too difficult/frequently missed).
     - Card rarity drop rate distribution.
  3. Add `ANALYTICS` tab to Admin `BottomNav.tsx`.
- **Acceptance Criteria**: Admins can see telemetry graphs and missed question statistics.

---

### Domain 5: Progression, Deck Builder, Trails & Forge

- **Assigned Lead**: **Nontokozo / Nontobeko** (Member 5)
- **Current Status**: Card collection works, but locked cards are hidden, and DeckBuilder is not mounted in routing.
- **What Needs to be Polished / Built**:

#### Task 5.1: Mount DeckBuilder Screen & Add Profile Navigation Hub

- **Target Files**: `frontend/src/App.tsx`, `frontend/src/screens/Profile.tsx`, `frontend/src/screens/DeckBuilder.tsx`
- **What to do**:
  1. In `App.tsx`, add `{screen === 'deck' && <DeckBuilder />}` to the screen content switcher.
  2. In `Profile.tsx`, implement a navigation grid using `onNavigate`:
     - Quick buttons for **Deck Builder**, **Campus Leaderboard**, **Ranked Matches**, **Quest Trails**, **Card Forge**, and **Trading**.
- **Acceptance Criteria**: Players can open and edit their 5-card battle deck directly from the navigation.

#### Task 5.2: Un-hide Locked Landmark Cards in Collection

- **Target File**: `frontend/src/screens/CardCollection.tsx` (Line 353)
- **What to do**:
  1. Remove `.filter((e) => e.unlocked)` so both unlocked and locked cards remain in the state.
  2. Unlocked cards display full stats and holographic effects.
  3. Locked cards render with dimmed styling, lock badges, and their specific landmark unlock hints (e.g. _"Walk to Great Hall to unlock"_).
- **Acceptance Criteria**: Collection gallery displays the complete campus album, motivating exploration.

#### Task 5.3: Connect Live Data to Campus Leaderboard

- **Target File**: `frontend/src/screens/Leaderboard.tsx`
- **What to do**:
  1. Replace hardcoded `DEFAULT_PLAYERS` with a live call to `getMockUsers()` (`/api/users`).
  2. Sort students by Total XP or Elo rating.
  3. Display division badges (Bronze, Silver, Gold, Platinum, Diamond) and daily streak indicators.
- **Acceptance Criteria**: Newly registered users and recent battle winners dynamically appear on the leaderboard.

#### Task 5.4: Activate Duplicate Card Forge & Scrapping

- **Target Files**: `frontend/src/screens/CardForge.tsx`, `backend/src/routes/content.ts`
- **What to do**:
  1. Connect `CardForge.tsx` to user's real card duplicates (`quantity > 1`).
  2. Allow scrapping duplicate cards for Essence currency.
  3. Allow upgrading card level (+5 ATK, +5 DEF, +5 SPD, +5 BRN) for 100 Essence + 1 duplicate card copy.
- **Acceptance Criteria**: Duplicate cards are meaningful assets rather than dead inventory weight.

---

### Domain 6: Anti-Cheat Trust Score, Ranked & Territory

- **Assigned Lead**: **Keoratile / Kea** (Member 6)
- **Current Status**: Speed violation and teleport alerts exist in `antiCheat.ts`; user schema tracks Elo.
- **What Needs to be Polished / Built**:

#### Task 6.1: Adaptive Trust Scoring Engine (0–100 Scale)

- **Target Files**: `frontend/src/utils/antiCheat.ts`, `backend/src/routes/telemetry.ts`, `frontend/src/screens/admin/AdminAntiCheat.tsx`
- **What to do**:
  1. Implement trust scoring algorithm:
     - Baseline score: 100 points.
     - Speed violation ($v > 15\text{ m/s}$): $-15$ points.
     - Teleport violation ($> 500\text{m}$ in $< 30\text{s}$): $-30$ points.
     - Duplicate simultaneous check-ins: $-25$ points.
  2. Display student Trust Score badge in `AdminAntiCheat.tsx`.
  3. Accounts with trust scores below 40 are flagged for human review; below 20 are restricted from ranked queue.
- **Acceptance Criteria**: Students have a dynamic trust rating that decreases upon suspicious movement.

#### Task 6.2: Ranked Matchmaking Queue & Seasonal Divisions

- **Target Files**: `frontend/src/screens/RankedMatchmaking.tsx`, `backend/src/routes/battle.ts`
- **What to do**:
  1. Connect `RankedMatchmaking.tsx` to active student list (`/api/users`).
  2. Allow queueing for ranked matches with Elo matchmaking bracket ($\pm 200$ Elo).
  3. Post-match Elo calculation updates user record and moves them across division tiers.
- **Acceptance Criteria**: Players can queue against matched student opponents and climb the ranked ladder.

#### Task 6.3: Campus Faction Territory Control

- **Target Files**: `frontend/src/screens/TerritoryMap.tsx`, `backend/src/routes/battle.ts`
- **What to do**:
  1. Define 3 campus precincts: _East Campus_, _West Campus_, and _Health Sciences_.
  2. Winning battles within a precinct shifts control percentage towards the student's faction.
  3. Update SVG polygon colors and control bars dynamically.
- **Acceptance Criteria**: Winning card duels shifts zone control influence over campus sectors.

---

## 4. Shared DevOps, Quality & Documentation Tasks

### Task 7.1: Migrate CI/CD Pipeline to Gitea Actions

- **Target File**: `.gitea/workflows/ci.yml` (NEW)
- **What to do**:
  1. Create `.gitea/workflows/ci.yml` configured for Wits Gitea runners (`https://sdp.ms.wits.ac.za`).
  2. Remove the GitHub-only check (`if: github.server_url == 'https://github.com'`).
  3. Pipeline stages:
     - Install dependencies.
     - ESLint code quality gate.
     - TypeScript typecheck (`tsc --noEmit`).
     - Vitest suite with $\ge 80\%$ coverage threshold.
     - Frontend & backend production builds.
- **Acceptance Criteria**: Gitea triggers automated tests on every push and pull request with green checkmarks.

### Task 7.2: Consolidate All Documentation into MkDocs

- **Target Files**: `docs/`, `mkdocs.yml`
- **What to do**:
  1. Move standalone root markdown files into `docs/`:
     - `SPRINT1.md` $\to$ `docs/sprints/sprint-1.md`
     - `WITS_QUEST_FEATURE_HANDOVER_GUIDE.md` $\to$ `docs/project/handover-guide.md`
     - `WITS_QUEST_DATABASE_PLAN.md` $\to$ `docs/database/database-plan.md`
     - `FEATURES_STATUS_AND_GAP_ANALYSIS.md` $\to$ `docs/project/gap-analysis.md`
  2. Update `mkdocs.yml` navigation structure to index all documentation pages.
  3. Test build with `python -m mkdocs build` to ensure 0 broken links.
- **Acceptance Criteria**: One unified MkDocs documentation site contains all project guides, UML, and sprint history.

### Task 7.3: Streamline Root `README.md`

- **Target File**: `README.md`
- **What to do**:
  1. Condense the 25KB verbose document into a sleek, executive-level project portal.
  2. Include badges (Build, Coverage, Gitea Actions, Version).
  3. Showcase feature highlights with screenshots/ASCII diagrams.
  4. Provide clean 2-step setup instructions (`npm run dev:frontend`, `npm run dev:backend`).
  5. Direct all deep-dive architecture and domain guides to the MkDocs portal.
- **Acceptance Criteria**: Clean, professional README that immediately impresses markers.

### Task 7.4: Repository Separation (Frontend & Backend on Gitea)

- **Target Files**: `scripts/split-repos.ps1`, `scripts/split-repos.sh`
- **What to do**:
  1. Provide git subtree scripts to cleanly export:
     - `frontend/` $\to$ `https://sdp.ms.wits.ac.za/big-o/wits-quest-frontend.git`
     - `backend/` $\to$ `https://sdp.ms.wits.ac.za/big-o/wits-quest-backend.git`
  2. Maintain standalone `package.json`, environment templates, and CI configs in each repository.
- **Acceptance Criteria**: Team members can clone and run frontend or backend in dedicated repositories.

---

## 5. How to Claim a Task & Git Workflow

1. **Pick a Task**: Review the matrix in Section 2 and choose your feature task.
2. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/<your_name>-<feature_name>
   # Example: git checkout -b feature/junior-nearby-avatars
   # Example: git checkout -b feature/kgothatso-auth-fallback
   ```
3. **Run Verification Before Committing**:
   ```bash
   # Run tests and ensure 80%+ coverage
   npm test
   # Run build check
   npm run build
   ```
4. **Push & Open Pull Request**:
   ```bash
   git push origin feature/<your_name>-<feature_name>
   ```
   Open a Pull Request on Gitea (`https://sdp.ms.wits.ac.za/big-o/Wits-Quest`) and request review from your teammates.
