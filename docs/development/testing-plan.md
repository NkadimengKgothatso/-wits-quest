# Full-Application Testing & Gitea CI/CD Pipeline Plan

This document outlines the end-to-end plan for full test coverage across Wits Quest (Frontend & Backend) and configuring a GitHub/Gitea CI/CD pipeline with a staged test coverage gate (**60% now, rising to 80% for the final submission**).

---

## 1. Overview & Objectives

- **Full Application Test Suite**:
  - Meet the **coverage gate** across lines, functions, statements, and branches on both `frontend` and `backend`: **60% minimum** (the rubric's advanced band) during Sprint 3, **raised to 80%** for the final submission.
  - Comprehensive unit, integration, and UI component tests covering all user flows, admin management, battle mechanics, landmark geolocation, anti-cheat detection, and Supabase data operations.
  - **Every new feature ships with tests**: API tests (Supertest) for backend endpoints and UI tests (React Testing Library) for frontend behaviour, written in the same PR as the feature.
- **CI/CD Pipeline with GitHub & Gitea Reflection**:
  - Run all tests, linting, typechecks, and coverage checks on free cloud runners via GitHub Actions.
  - CI reports coverage for **both code bases** and fails the build if either falls below the current gate.
  - Automatically report commit statuses, test results, and coverage metrics back to Gitea via the Gitea Commit Status REST API (`POST /api/v1/repos/:owner/:repo/statuses/:sha`).
  - Strict Deployment Gate: Deploys only when all tests pass and coverage meets the current gate.

### Coverage gate schedule

| Stage | Gate (statements, branches, functions, lines) | Applies to |
| :--- | :--- | :--- |
| Sprint 3 (current) | **60%** | Frontend and backend, enforced in CI |
| Final submission | **80%** | Frontend and backend, enforced in CI |

The frontend already exceeds the final 80% target on all four metrics. The backend passes the current 60% gate on all four metrics but is **below the final 80% target** on statements, functions and lines, and just short on branches (see [Sprint 3 status](#6-sprint-3-status)).

---

## 2. Frontend Test Suite Architecture

### Setup & Configuration

- Vitest with `jsdom`, `@testing-library/react`, `@testing-library/jest-dom`, and `@testing-library/dom`, with V8 coverage (`vitest run --coverage`).
- Global mocks for browser APIs (`fetch`, `localStorage`, `navigator.geolocation`, Leaflet map containers, canvas-confetti).

### Target Test Coverage Areas

1. **Authentication & Session**:
   - `AuthContext.test.tsx` & `Login.test.tsx`: Student vs Admin authentication, JWT handling, error states, role redirection.
2. **Battle Engine & AI**:
   - `battleEngine.test.ts`: Round resolution, stat match-ups (Attack vs Defense, Speed vs Brains), tie-breakers, XP/Essence rewards.
   - `battleAI.test.ts`: Predictive card selection, counter-card choice against user hand.
   - `BattleArena.test.tsx`: Interactive combat loop, round timers, victory/defeat modal display.
3. **Campus Landmarks & Trivia**:
   - `MapExplorer.test.tsx`: Geolocation radar, 25m radius geofence detection, interactive landmark markers.
   - `TriviaModal.test.tsx`: Multiple-choice selection, text keyword matching, rewards granting (XP/cards), cooldown handling.
4. **Card Collection & Deck Builder**:
   - `CardCollection.test.tsx`: Category & rarity filtering, locked vs unlocked cards, card detail dialog.
   - `DeckBuilder.test.tsx` & `deckService.test.ts`: 5-card deck constraint, stat budget limit ($300$), legendary cap ($1$), server persistence.
5. **Leaderboard & Profile**:
   - `Leaderboard.test.tsx`: Division tiers (Bronze $\rightarrow$ Diamond), Elo sorting, active status indicators.
   - `Profile.test.tsx`: Avatar customization, daily streak multiplier, stats summary.
6. **Admin Portals**:
   - `AdminContent.test.tsx`: Card authoring, trivia creation, image upload handling.
   - `AdminEvents.test.tsx`: Event creation, active status toggles, date validation.
   - `AdminAntiCheat.test.tsx`: Telemetry audit log display, violation flagging, account suspension actions.
7. **Service Layer**:
   - `apiClient.test.ts`, `inventoryService.test.ts`, `offlineQueue.test.ts`.

---

## 3. Backend Test Suite Architecture

### Setup & Configuration

- Vitest + Supertest with Node.js 20 environment.
- Supabase client integration testing and mocked database fixtures.
- **Feature rule:** every new backend endpoint ships with Supertest API tests covering the success path, validation failures, authentication/authorisation, and the 500 error path, in the same PR as the feature.

### Target Test Coverage Areas

1. **Authentication Routes** (`/api/auth/*`):
   - Register validation (Wits student email regex `\d{7}@students.wits.ac.za`, admin `@wits.ac.za`).
   - Bcrypt password hashing, JWT creation & `authMiddleware` verification.
   - Account suspension interceptor (anti-cheat policy enforcement).
2. **User & Inventory Routes** (`/api/users/*`):
   - User profile queries, stat updates, and inventory card queries.
3. **Deck Management Routes** (`/api/player/deck`, `/api/users/:id/decks`):
   - Server-side validation of 5-card count, stat budget, and legendary card limit.
   - Supabase `user_decks` upsert and retrieval.
4. **Content, Events & Trivia Routes** (`/api/cards`, `/api/events`, `/api/trivia`, `/api/events/:id/answer`):
   - Card catalogue queries and creation.
   - Campus events CRUD.
   - Server-side trivia answer verification, XP & Essence rewards, and card distribution into `user_cards`.
5. **Anti-Cheat & Telemetry Routes** (`/api/mock/telemetry/*`):
   - Ingestion of student GPS coordinates.
   - Haversine velocity calculations ($>15\text{ m/s}$ threshold triggers teleportation/speeding violation).
   - Audit log querying and admin action execution (`flagged` / `suspended`).
6. **Real-time Battle WebSockets**:
   - Socket.io connection, room matchmaking, live stat emit, and round resolution events.

---

## 4. CI/CD Pipeline & Gitea Integration

### Workflow Architecture (`.github/workflows/ci.yml` & `.gitea/workflows/ci.yml`)

```mermaid
graph TD
    A[Push / PR to Git / GitHub / Gitea] --> B[GitHub Actions Runner]
    B --> C[1. Lint & Typecheck: tsc --noEmit]
    C --> D[2. Frontend Tests: Vitest with coverage gate]
    D --> E[3. Backend Tests: Vitest + Supertest with coverage gate]
    E --> F[4. Production Build: npm run build]
    F --> G{All Passed & Coverage >= current gate?}
    G -- Yes --> H[Deploy Production / Staging]
    H --> I[Post Success to Gitea Commit Status API ✓]
    G -- No --> J[Block Deployment & Fail Build]
    J --> K[Post Failure to Gitea Commit Status API ✗]
```

The "current gate" is 60% in Sprint 3 and 80% for the final submission.

### Gitea Status Reflection Mechanism

- The workflow concludes with an HTTP call to Gitea's Commit Status API:
  ```bash
  POST https://<gitea-domain>/api/v1/repos/<owner>/<repo>/statuses/<commit_sha>
  Header: Authorization: token <GITEA_TOKEN>
  Body: {
    "state": "success" | "failure",
    "target_url": "https://github.com/<owner>/<repo>/actions/runs/<run_id>",
    "description": "Coverage: 89% | All tests passed",
    "context": "ci/github-actions"
  }
  ```
- Result: Gitea's web UI displays live green checkmarks or red X badges next to commits and pull requests.

---

## 5. Verification Plan

1. **Frontend Tests**: Run `npm test` inside `frontend/` $\rightarrow$ verify all test suites pass and code coverage meets the current gate (60% now, 80% final).
2. **Backend Tests**: Run `npm test` inside `backend/` $\rightarrow$ verify all API and socket test suites pass and code coverage meets the current gate.
3. **Builds**: Run `npm run build` on both frontend and backend $\rightarrow$ 0 TypeScript / bundling errors.
4. **CI Configuration**: Validate `.github/workflows/ci.yml` and `.gitea/workflows/ci.yml` syntax.
5. **Performance and accessibility**: Run PageSpeed Insights (Lighthouse) against the production URL for both Desktop and Mobile and record the scores (see section 7).
6. **Feature rule**: For every new feature PR, confirm it includes Supertest API tests (backend) and React Testing Library UI tests (frontend) before merge.

---

## 6. Sprint 3 status

### Frontend run (2026-09-29)

Command: `npm run test` in `frontend/` (`vitest run --coverage`, Vitest v1.6.1, V8 coverage).

| Metric | Result |
| :--- | :--- |
| Test files | **20 passed** (20) |
| Tests | **163 passed** (163) |
| Duration | 13.84 s |

![Frontend test run and V8 coverage report, 2026-09-29](images/2026-09-29-frontend-coverage.jpeg)

*Terminal output of `npm run test` in `frontend/`: 20 files and 163 tests passing, with the V8 coverage report.*

**Overall coverage**

| Statements | Branches | Functions | Lines | Current gate (60%) | Final gate (80%) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **89.21%** | **83.03%** | **83.33%** | **89.21%** | ✅ Pass | ✅ Pass |

**Test files and tests per suite**

| Suite | Tests |
| :--- | :--- |
| `utils/battleEngine.test.ts` | 30 |
| `__tests__/elo.test.ts` | 17 |
| `__tests__/services.test.ts` | 17 |
| `__tests__/antiCheat.test.ts` | 15 |
| `screens/Leaderboard.test.tsx` | 14 |
| `utils/battleAI.test.ts` | 13 |
| `services/offlineQueue.test.ts` | 9 |
| `context/AuthContext.test.tsx` | 6 |
| `__tests__/cardCollection.test.tsx` | 6 |
| `__tests__/components.test.tsx` | 6 |
| `screens/TriviaModal.test.tsx` | 5 |
| `__tests__/battleAI.test.ts` | 5 |
| `__tests__/battleEngine.test.ts` | 5 |
| `screens/BattleArena.test.tsx` | 4 |
| `components/BottomNav.test.tsx` | 3 |
| `screens/AsyncBattleArena.test.tsx` | 2 |
| `screens/AsyncPvP.test.tsx` | 2 |
| `screens/BattleArena.deck.test.tsx` | 2 |
| `__tests__/index.test.ts` | 1 |
| `App.test.tsx` | 1 |

**Coverage by area**

| Area | Statements | Branches | Functions | Lines |
| :--- | :--- | :--- | :--- | :--- |
| `components` | 84.08% | 73.33% | 57.14% | 84.08% |
| `screens` | 79.91% | 65.21% | 33.33% | 79.91% |
| `services` | 98.34% | 67.74% | 100% | 98.34% |
| `utils` | 92.87% | 93.60% | 92% | 92.87% |

**Fully covered:** `antiCheat.ts` (100% on every metric), `deckService.ts` (100% statements, functions and lines), `battleAI.ts` (100% statements, functions and lines).

### Known gaps (reported honestly)

| File | Gap | Detail |
| :--- | :--- | :--- |
| `RankedMatchmaking.tsx` | 33.33% functions, 65.21% branches | Uncovered lines 16-17, 31-38, 121-160 |
| `TopBar.tsx` | 33.33% functions, 53.84% branches | Uncovered lines 40-46, 219-269 |
| `KuduMascot.tsx` | 50% functions | Uncovered lines 34, 40-45, 110, 192-205 |
| `cardCatalogService.ts` | 41.66% branches | Uncovered lines 146, 149-150, 158-159 |
| `battleEngine.ts` | 75% functions | Uncovered lines 239, 242, 280-285, 295-342 |

These fall below 80% at file or area level even though the global thresholds pass. They are the first targets for the final-submission push.

### Planned versus delivered

Section 2 lists the target suite. Several planned files (`Login`, `MapExplorer`, `DeckBuilder`, `Profile`, and the three `Admin*` tests) do not appear in the current run, while the delivered suite adds `antiCheat`, `elo`, `services`, `components`, `AsyncBattleArena`, `AsyncPvP`, `BattleArena.deck` and `BottomNav`. The coverage numbers meet the gate, but the plan's per-screen list is not yet fully delivered.

### Backend run (2026-09-29)

Command: `npm run test` in `backend/` (`vitest run --coverage`, Vitest v1.6.1, V8 coverage, Supertest for API tests).

| Metric | Result |
| :--- | :--- |
| Test files | **29 passed** (29) |
| Tests | **452 passed** (452) |
| Duration | 8.85 s |

**Overall coverage**

| Statements | Branches | Functions | Lines | Current gate (60%) | Final gate (80%) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **63.91%** | **78.74%** | **70.90%** | **63.91%** | ✅ Pass | ❌ Not yet (branches 1.26 points short; statements, functions and lines further) |

**Test files and tests per suite**

| Suite | Tests |
| :--- | :--- |
| `routes/content.test.ts` | 60 |
| `routes/contentLifecycle.test.ts` | 46 |
| `routes/trades.test.ts` | 38 |
| `routes/auth.test.ts` | 30 |
| `routes/asyncBattle.test.ts` | 24 |
| `server.test.ts` | 21 |
| `routes/ranked.test.ts` | 20 |
| `routes/campaigns.test.ts` | 19 |
| `utils/asyncChallengeState.test.ts` | 18 |
| `utils/cpuBattle.test.ts` | 16 |
| `services/battleSocketHandler.test.ts` | 15 |
| `routes/adminGuards.test.ts` | 15 |
| `utils/presence.test.ts` | 14 |
| `services/deckService.data.test.ts` | 12 |
| `utils/streakRules.test.ts` | 12 |
| `utils/analyticsRules.test.ts` | 11 |
| `utils/battleResolution.test.ts` | 10 |
| `routes/leaderboard.test.ts` | 10 |
| `routes/deck.test.ts` | 9 |
| `services/eventPlacementService.test.ts` | 8 |
| `services/applyMatchResult.test.ts` | 7 |
| `utils/streak.test.ts` | 7 |
| `middleware/auth.test.ts` | 6 |
| `routes/battle.test.ts` | 6 |
| `services/deckService.test.ts` | 4 |
| `routes/usersUpdate.test.ts` | 4 |
| `routes/routing.test.ts` | 4 |
| `services/autoPublishContent.test.ts` | 3 |
| `routes/telemetry.daysAgo.test.ts` | 3 |

**Coverage by area**

| Area | Statements | Branches | Functions | Lines |
| :--- | :--- | :--- | :--- | :--- |
| `src` (`server.ts`) | 68.36% | 68.42% | 66.66% | 68.36% |
| `src/config` | 100% | 100% | 100% | 100% |
| `src/db` | 1.70% | 0% | 0% | 1.70% |
| `src/middleware` | 93.75% | 85% | 100% | 93.75% |
| `src/routes` | 62.22% | 77.24% | 45.83% | 62.22% |
| `src/services` | 83.33% | 74.69% | 85.71% | 83.33% |
| `src/utils` | 84.73% | 91.07% | 75% | 84.73% |

**Strong areas:** `content.ts` (92.15% statements), `requireAdmin.ts`, `dropRates.ts`, `campaignWindow.ts`, `streak.ts` and `streakRules.ts` (100%), `applyMatchResult.ts` (97.91%), `deckService.ts` (100% statements and lines), and the socket layer `battleSocketHandler.ts` (76.82% statements, 89.47% functions) covering lobby, challenges, divisions, spectators, turn validation and round resolution.

**Negative-path evidence:** the `stderr` lines in the run (for example `[Cards] Create error`, `ACCEPT TRADE ERROR: Trade has expired`, `OPENROUTESERVICE_API_KEY is not configured`) are not failures. They are the application's error handlers logging while tests deliberately trigger database failures, expired trades, missing configuration and upstream 502s to prove the correct 4xx/5xx responses.

### Backend known gaps (reported honestly)

| File | Coverage | Uncovered (main ranges) |
| :--- | :--- | :--- |
| `db/productionContent.ts` | 0% (751 lines) | Production seed content, lines 1-751 |
| `db/seedProduction.ts` | 0% (113 lines) | Seed script, lines 1-113 |
| `routes/telemetry.ts` | 17.63% statements, 16.66% functions | Most ingestion and audit handlers |
| `routes/adminAchievements.ts` | 29.37% statements, 0% functions | Lines 32-171 |
| `utils/achievements.ts` | 26.59% statements, 0% functions | Lines 36-188 |
| `routes/battle.ts` | 38.5% statements, 0% functions | Lines 54-261 |
| `routes/analyticsQuestions.ts` | 41.66% statements | Lines 16-46 |
| `routes/trades.ts` | 66.98% statements, 0% functions | Trade creation and listing handlers |
| `routes/auth.ts` | 64.88% statements, 0% functions | Lines 61-286 |
| `utils/antiCheat.ts` | 66.89% statements, 25% functions | Lines 46-123 |
| `services/battleSocketHandler.ts` | 76.82% statements | Reconnect and late-game handlers, lines 744-820 |

**What is dragging the total below 80%:** the two seed files under `src/db` account for about 860 lines at 0%, which alone pulls the statement and line totals down. The remaining gap sits in `telemetry.ts`, the achievements modules, `battle.ts`, and `antiCheat.ts`.

### Path to the 80% final gate (backend)

1. Decide whether one-off seed scripts (`productionContent.ts`, `seedProduction.ts`) belong in the coverage denominator; if they are excluded in the Vitest `coverage.exclude` config, document that decision in the decisions log with its rationale.
2. Add Supertest tests for `telemetry.ts` (GPS ingestion, Haversine speed violations, audit log, flag/suspend actions), which is the anti-cheat feature the stakeholder praised.
3. Add tests for `adminAchievements.ts` and `achievements.ts`, the remaining `battle.ts` handlers, and the uncovered functions in `trades.ts` and `auth.ts`.
4. Re-run and record the new figures on this page before the final submission.

---

## 7. Performance and accessibility testing

Beyond functional tests, the deployed production build was audited with Google PageSpeed Insights (Lighthouse) to check load performance, accessibility, best practices and SEO.

**Run details:** [wits-quest.vercel.app](https://wits-quest.vercel.app/), **Desktop** form factor, 2026-09-29 at 13:43 (GMT+2), emulated desktop, initial page load, single page session.

![PageSpeed Insights category scores for wits-quest.vercel.app, Desktop, 2026-09-29](images/2026-09-29-pagespeed-scores.jpeg)

| Category | Score | Result |
| :--- | :--- | :--- |
| Performance | **99** | ✅ Green (90-100) |
| Accessibility | **97** | ✅ Green, one issue flagged (below) |
| Best Practices | **100** | ✅ Green |
| SEO | **90** | ✅ Green (at the lower edge of the band) |
| Agentic Browsing | **2/2** | ✅ All checks passed |

### Core performance metrics

![PageSpeed Insights core web vitals metrics, Desktop, 2026-09-29](images/2026-09-29-pagespeed-metrics.jpeg)

| Metric | Result | Status |
| :--- | :--- | :--- |
| First Contentful Paint (FCP) | 0.7 s | ✅ Good |
| Largest Contentful Paint (LCP) | 0.9 s | ✅ Good |
| Total Blocking Time (TBT) | 0 ms | ✅ Good |
| Cumulative Layout Shift (CLS) | 0 | ✅ Good |
| Speed Index | 0.7 s | ✅ Good |

All five metrics fall in the green band. The real-user (field data) panel shows "No Data", which is expected for a new site without enough Chrome traffic, so these are lab results only.

### Accessibility finding

![PageSpeed Insights accessibility audit, Desktop, 2026-09-29](images/2026-09-29-pagespeed-accessibility.png)

| Finding | Category | Impact | Planned fix |
| :--- | :--- | :--- | :--- |
| Document does not have a main landmark | Accessibility best practice | Screen-reader users cannot jump straight to the main content | Wrap the primary page content in a single `<main>` element in the app shell |

![PageSpeed Insights accessibility audit summary and Best Practices score, Desktop, 2026-09-29](images/2026-09-29-pagespeed-audit-summary.jpeg)

| Accessibility audit breakdown | Count |
| :--- | :--- |
| Failed (flagged) | 1 |
| Passed audits | 14 |
| Additional items to check manually | 10 |
| Not applicable | 48 |

The 10 manual-check items are areas that automated tools cannot cover (keyboard navigation, focus order, screen-reader behaviour, and similar). Related manual finding from the stakeholder review: text boxes lose visibility in dark mode ([Stakeholder Reviews](../project/stakeholder-reviews.md)), which automated audits do not catch.

### Limits of this evidence

- Only the **Desktop** run is recorded. Wits Quest is played on phones, so a **Mobile** run (which applies throttled CPU and network) should be captured and added before the final submission.
- Scores are a single-run lab snapshot and vary slightly between runs.
- The SEO score of 90 is green but has the least headroom; the individual failing audit was not captured.

### Actions

| Action | Owner | Status |
| :--- | :--- | :--- |
| Add a `<main>` landmark to the app shell | Team | To do |
| Run and record the Mobile audit | Team | To do |
| Re-run after fixes and record the new accessibility score | Team | To do |
