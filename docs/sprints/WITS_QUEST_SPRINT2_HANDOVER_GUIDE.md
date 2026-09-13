# Wits Quest (COMS3011A Project 6) — Sprint 2 Handover Guide

**Prepared by:** Mahlatse Clayton
**Date:** 8 September 2026
**Sprint:** 08 → 15 Sep 2026 · **Milestone 2 demo: Tuesday 15 Sep**

Who does what, with each task explained in simple words. Fix IDs (`F##`) point to `WITS_QUEST_FIXES_AND_OUTSTANDING_FEATURES.md`; the full roadmap is in `WITS_QUEST_MASTER_GUIDE_V2.md`.

## 1. Task Board

| Member | Area | Tasks |
| :--- | :--- | :--- |
| **Kgothatso** | Login & Docs | Supabase Auth, fix signup, docs repo + deploy, tidy docs |
| **Nontokozo** | Cards, Progression & Territory | Locked cards visible, live leaderboard, Card Forge, territory control |
| **Mahlatse** | PvP & Offline | Async PvP, live PvP, offline answers, battle hub, CPU battle rules, real streaks |
| **Junior** | Quality, Map & Repos | Lints, event time states, online player pings on map, card awarded once, repo split |
| **Rea** | Admin & Curation | Draft → publish for events, questions and cards; only admins can author; curation completion; automatic event placement |
| **Keoratile** | Anti-Cheat & Analytics | Analytics dashboard, achievements, movement checks, trust score |

## 2. Who Does What

### Kgothatso — Login & Docs
1. **Move login to Supabase Auth** — Supabase handles the accounts for us: it sends the verification and password-reset emails and issues the login tokens, so we delete our own email/OTP code and its bugs. Frontend `AuthContext.tsx`, backend `middleware/auth.ts` (keep `req.user = { id, email, role }` exactly as-is so teammates' code doesn't change); keep `@students.wits.ac.za`-only signups; move existing players over; delete `emailService.ts`. (F7, F9, F30)
2. **Fix signup** — a new player registers, gets the email, clicks it, logs in, and lands in the game with their 5 starter cards and default deck — first try, every time.
3. **Docs repo + deploy** — a new `wits-quest-docs` repo holding `docs/`, `mkdocs.yml`, `requirements.txt` and the root guides, deployed to GitHub Pages so the team's documentation lives at one public link.
4. **Tidy docs** — remove the leftover merge-conflict markers in the feature handover guide (F49), fix the README's dead links (F48) and wrong workflow names (F44), fill or delete the empty meeting records (F52).

### Nontokozo — Cards & Progression
1. **Locked cards visible** — the collection shows every card: owned ones bright, missing ones greyed out with a "walk to X to unlock" hint, so players can see what's still out there to collect. `CardCollection.tsx` — remove the filter that hides locked cards. (F25)
2. **Live leaderboard** — the leaderboard lists real players, sorted by XP and Elo with their level, division and streak — not the made-up names hardcoded today. New `GET /api/users/leaderboard`; wire `Leaderboard.tsx`. (F18)
3. **Card Forge** — duplicates become useful instead of dead weight: scrap a duplicate for Essence, or spend 2 duplicates + 100 Essence to give a card +5 on every stat. New `routes/forge.ts`; wire `CardForge.tsx`. (F20, F40)
4. **Territory control** — campus splits into zones that players hold and take from each other: every zone shows who owns it, and winning a battle at an event inside a zone flips the zone to the winner. Replace the static mock in `TerritoryMap.tsx` with real zones backed by a `territories` table. (F23)

### Mahlatse — PvP & Offline
1. **Async PvP backend** — player A challenges player B; each takes their turn whenever they open the app; the server holds the match in between; ignore it for 24 hours and you forfeit automatically. The server compares the card stats and decides every round — the app only ever sends which stat was picked. New `routes/asyncBattle.ts` on the `async_pvp_challenges` table. (I-3)
2. **Wire the Async PvP screen** — the screen lists your real matches and whose turn it is, and lets you play your round — replacing today's mock data. `AsyncPvP.tsx`. (F14)
3. **Battle hub** — the Battle screen becomes a picker: "Play CPU" or "Challenge a Player" (replaces the "coming soon" alert). `BattleArena.tsx`. (F17)
4. **Redesign the CPU battle rules** — decide how the match against the computer actually plays and write the rulebook: how many rounds, who picks first and when that flips, what happens on a tie, whether a card's category gives it an edge, and what a win or a loss pays out — then implement those rules in the engine so every match follows them. `battleEngine.ts`, `battleAI.ts`, `BattleArena.tsx`.
5. **Real streaks** — daily streaks count for real instead of being fixed numbers: play on consecutive days and the streak grows, miss a day and it resets (multiplier ×1.10 at 3 days, ×1.25 at 7 days applied to XP earned). New `routes/progression.ts` daily check-in (compares `lastCheckInDate`), fix the hardcoded values in `db/seed.ts`, replace the mock streaks in `RankedMatchmaking.tsx` — TopBar's streak then shows the live number. (F28, F38)
6. **Live PvP** — two players play the same match at the same time, with turns on a timer and a player who drops out able to rejoin where they left off; others can watch. The Socket.IO battle rooms already exist — wire `LivePvPArena.tsx` to them with real saved decks, and take the socket URL from the environment instead of the hardcoded localhost. (F24, F11)
7. **Offline answers** — a player inside a building with no signal can still open an event they've reached and answer it; the answer waits on the phone and sends itself when the signal comes back. `TriviaModal.tsx` saves the answer (with the position captured at answer time) into `offlineQueue.ts` when offline, shows an "offline — will sync" badge, and replays it on reconnect. (F42)

### Junior — Quality, Map & Repos
1. **Lints & code quality** — ESLint and Prettier automatically check everyone's code when committing and in CI, catching mistakes early and keeping six people's code in one style. Both packages + husky/lint-staged + a CI lint job. No whole-codebase reformat mid-sprint.
2. **Event time states** — every event shows its time state at a glance: upcoming (starts later — shows when), active (playable now), passed (finished — clearly looks done). New `utils/eventStates.ts` + marker styling in `MapExplorer.tsx`; also merge the campus-landmarks list that's copy-pasted in two places into one shared module. (B-1, F34)
3. **Online player pings on the map** — the map shows who is out on campus right now: live player markers that move as people walk, so you can see others collecting cards and battling nearby. Players already send telemetry pings with their position (the existing ping endpoint) — surface those pings on `MapExplorer.tsx` as small markers with the player's name, refreshing every few seconds, plus what they just did (e.g. "just collected a card").
4. **Card awarded once** — answering the same event correctly a second time gives nothing: each player's completed events are recorded in a new `event_attempts` table and repeat answers are refused — a card is only worth collecting if it had to be walked to, once. (F6)
5. **Repo split** — at the 14 Sep freeze the monorepo splits into `wits-quest-frontend` and `wits-quest-backend` (full git history kept), each with its own CI and deploy; together with Kgothatso's docs repo that's the 3-repo structure.

### Rea — Admin & Curation
1. **Events, questions and cards start as drafts** — when an admin adds an event, question or card it goes to **draft** first: players can't see or earn it yet. From the console each item is then controlled through its lifecycle — publish it to make it live, retire it to take it down. Add a `status` column to events, trivia and cards; player-facing queries only ever show `PUBLISHED`; draft/publish/retire controls in `AdminEvents.tsx` / `AdminContent.tsx`. (I-7)
2. **Only admins can author** — creating events, questions and cards is for admins/lecturers; a student's login calling those APIs gets refused (today anyone can call them). Remove the unguarded duplicate routes in `server.ts` so only the guarded ones in `content.ts` run, and add a `requireAdmin` role check to them; seed one ADMIN account. (F4, F5)
3. **Curation completion** — the rest of the content lifecycle: a review step between draft and publish (a second admin approves before anything goes live), campaigns scheduled around a term or an open day, and questions everybody gets wrong automatically surfaced on the console so they can be repaired. Extends the `status` column and admin screens from task 1. (I-7)
4. **Automatic event placement** — instead of placing every event by hand, the game spreads events across campus itself: it picks spots along walkable paths, keeps events apart from each other, keeps a sensible number live at once, and moves them around over time so no part of campus stays empty. A placement service in the backend, triggered from the admin console.

### Keoratile — Anti-Cheat & Analytics
1. **Analytics dashboard** — a new admin screen showing how the game is actually being played: which events draw players and which are ignored, which questions everyone aces (too easy) or everyone bombs, and whether cards are coming out at the rate we intended. New AdminAnalytics screen fed from the existing telemetry/events/battle data. (brief: the console "should show how the game is actually being played")
2. **Achievements** — badges that give players reasons to keep going: first card collected, first battle won, 10 battles, reaching level 5/10, completing a full deck — shown on the Profile as locked/unlocked. New achievements tables, award logic on the existing XP/battle/card events, and a Profile section. (F39)
3. **Movement checks** — the game looks at how a player has been moving, not just where they claim to be: journeys nobody could have walked (moving faster than possible between two points) and GPS fixes too poor to rely on. The telemetry pings players already send get checked on the server as they arrive, and suspicious movement is flagged. (F35–F37, I-2)
4. **Trust score** — the game builds a picture of each player over time — impossible movement, submissions sent more than once, accounts that only ever play each other — and turns it into a trust rating; suspects surface on the admin console for a person to judge, and the game answers with something proportionate rather than a single ban. Builds on the movement checks and the analytics data. (Advanced tier)

## 3. Done Means

Tests passing, CI green (`tsc`, lint, 80% coverage), merged via reviewed PR, works on a real phone on campus, PR cites its fix IDs.

## 4. Sprint 3 — Everything Still Outstanding to Complete the Project

**Finish the Basic tier — trustworthy check-ins and battles**
- Server-side location check (F1, F3) — the server, not the browser, verifies the player is really at the event before accepting an answer; who answered comes from the login token, never the request.
- Server-enforced CPU battles (F2, F31) — the server replays the rounds and decides the winner; the app can't declare its own result.

**Finish the Intermediate tier**
- Quest trails (I-6, F21) — events join up into trails completed in order, and the game points a player to what's nearby and still unvisited.
- Ranked matchmaking (F19) — the ranked ladder becomes real opponents of similar level instead of a mock list, with seasons that start over.

**Advanced tier — the finishing touches**
- P2P trading — an offer from each side and an exchange that completes for both or not at all, within limits that stop a collection being poured into one account.

**Platform**
- Deploy the backend (Render) and point the frontend at it (F47, F11) — the live Vercel app currently has no API to talk to; production deploys trigger from `main` only (F45).
