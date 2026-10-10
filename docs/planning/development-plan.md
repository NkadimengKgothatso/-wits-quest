# Development Plan

How we planned to build Wits Quest, from the brief to a submitted app, and how the plan changed along the way. The week-by-week timeline is on the [Roadmap](roadmap.md), the design on [System Design](system-design.md) and [UI Design](ui-design.md), and how the team works on [Project Methodology](../project/methodology.md).

---

## 1. Goal

Build a campus game for Wits in which students walk to real places, answer a trivia question about each place to win a collectible card, and battle with their cards against the computer or other players. The app should run in a phone browser with nothing to install, be fair (no faking your location), and be ready for real players by 11 October 2026.

## 2. Scope: the brief in three tiers

The brief splits the features into tiers. We planned to build them in order, so the game was playable at every milestone.

| Tier | Features | Planned for | Status |
| :--- | :--- | :--- | :--- |
| **Basic** | Campus map, location-gated trivia, card collection, decks, CPU battles, admin authoring console, login | Sprint 1, made secure in Sprint 2 | ✅ Done |
| **Intermediate** | Live and async PvP, leaderboard and divisions, daily streaks, offline answers, server-side location checks, anti-cheat telemetry | Sprints 2 and 3 | ✅ Done |
| **Advanced (selected)** | Quest trails, ranked seasons, trading, territory control, Card Forge, achievements, campus heatmaps, trust tiers | Sprint 3, polished in Sprint 4 | ✅ Done |

The full list is on [Requirements](../project/requirements.md) and [Scope](../project/scope.md).

## 3. Work split

Each member owns one area of the game end to end (screens, API routes, tables and tests), so six people can build in parallel without getting in each other's way.

| Member | Area |
| :--- | :--- |
| **Mahlatse** | Check-ins, battles, live PvP and the API; integration lead |
| **Oratile** | Anti-cheat and sound |
| **Kgothatso** | Achievements, analytics, streaks and documentation |
| **Rea** | Mobile UI, content curation and user testing |
| **Junior** | Trading, map, security and code quality |
| **Nontokozo** | Cards, quest trails, content, ranked and territory |

## 4. Technical approach

- **Architecture:** a React app (Vercel) talking to a REST API (Node and Express on Render), with Supabase for the database, login and storage ([System Design](system-design.md), [Tech Stack](../project/tech-stack.md)).
- **The server decides:** location, answers and battle results are checked on the server, never trusted from the phone.
- **Phone first:** every screen is designed for a phone held in one hand, then made to work on a laptop ([Responsiveness](../ux/responsiveness.md)).
- **Quality built in:** tests, lint and type-checks run before every push ([Code Quality](../tools/code-quality.md)).

## 5. Sprint plan

| Sprint | Dates | Goal | Key deliverables |
| :--- | :--- | :--- | :--- |
| **1** | 4 to 25 Aug | The core loop | Map, geofenced trivia, card collection, CPU battles, authoring console |
| **2** | 26 Aug to 15 Sep | Secure and multiplayer | Supabase Auth, server-checked answers and battles, live and async PvP, streaks, leaderboard, offline answers, CI, docs site |
| **3** | 15 to 29 Sep | Fair play and depth | Server location checks, anti-cheat with trust tiers, quest trails, ranked, trading, territory, achievements, QR check-in |
| **4** | 29 Sep to 11 Oct | Polish and submit | Four themes and the six-tab layout, card pictures, sound, UI review, clean live data, full testing, documentation |

Each sprint has a written plan with every task, owner and due date: [Sprint 1](../sprints/SPRINT1.md), [Sprint 2](../sprints/SPRINT2_FEATURE_SELECTION_AND_TASK_GUIDE.md), [Sprint 3](../sprints/SPRINT3_TASK_BOARD.md) and [Sprint 4](../sprints/SPRINT4_PLAN.md).

## 6. Risks and how we planned for them

| Risk | What could happen | What we did |
| :--- | :--- | :--- |
| GPS is easy to fake | Players collect cards without walking | Server-side distance and time checks, speed and teleport detection, trust tiers |
| Weak signal in buildings | Answers lost indoors | Offline queue on the phone, synced when the signal returns |
| Free hosting sleeps | The first request after a quiet spell is slow | Documented; a keep-awake ping during marking |
| Six people merging at once | Broken `main` | Feature branches, pre-push tests and an integration lead |
| Falling behind | Unfinished tiers at submission | Re-planned in Sprint 2 ([Master Guide V2](../sprints/master-guide-v2.md)) and postponed the riskiest Advanced features |
| Security of logins | Leaked password hashes | Moved to Supabase Auth in Sprint 2 |

## 7. How the plan changed

| When | Change | Why |
| :--- | :--- | :--- |
| Sprint 1 review | Added code-quality checks, split the repos, moved to Supabase Auth | Tutor feedback ([Stakeholder Reviews](../project/stakeholder-reviews.md#sprint-1-review-2026-08-13)) |
| Sprint 2 | Re-planned in Master Guide V2 with new dates | Sprint 2 ran behind |
| 15 Sep | Added avatars on the map and a friend system to the backlog | Zayd's feedback at the live demo |
| 28 Sep | Added dark-mode fixes, sound, how-to-play tips, history search | The stakeholder's app review |
| Sprint 4 | Feature freeze on 4 Oct; the last week is for fixes, testing and docs | Submission on 11 Oct |

The original plan for the whole project is the [Master Architecture Guide (PDF)](../project/files/wits-quest-master-architecture-task-specification-guide.pdf).
