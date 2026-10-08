# Sprint 3 Team Guide

**Prepared by:** Mahlatse Clayton · **Date:** 23 Sep 2026
**Sprint:** 15 → 29 Sep · **Milestone 3 demo: Tue 29 Sep** · **Final submission: Sun 11 Oct**

This covers everything the brief still needs **and every line of the Milestone 3 rubric**. Fix IDs (`F##`) point to `WITS_QUEST_FIXES_AND_OUTSTANDING_FEATURES.md`. **M3** means it must work at the 29 Sep demo. **Final** means it's due by 11 Oct.

Marks come from eight things: user feedback, automated testing, features, API, performance, improvement, documentation and methodology. Features are only 20% of it, so section 3 matters as much as section 1.

## 1. What Must Be Done, and by Who

|  #  | User story                                                                                                                                                                                                                                                  | Who                          |     Due     |
| :-: | :---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | :--------------------------- | :---------: |
|  1  | As a **player**, I can only answer an event's question when I'm really inside its radius and time window (the server checks, not my phone), so that cards have to be walked to.                                                                             | Mahlatse                     | M3 (24 Sep) |
|  2  | As a **player** with no signal inside a building, I can answer an event I've reached, and it's judged by where and when I answered once I reconnect, so that bad signal doesn't cost me the card.                                                           | Mahlatse                     |     M3      |
|  3  | As a **player**, I only choose my card and stat in a CPU battle, and the server decides the rounds, winner and rewards, so that nobody can fake a win.                                                                                                      | Mahlatse                     |     M3      |
|  4  | As a **player**, I can open a live match between two other players and watch it happen, so that I can follow friends' games.                                                                                                                                | Mahlatse                     |     M3      |
|  5  | As an **outside developer**, I can read our API docs and call any endpoint, with sensible paths, correct HTTP methods and no duplicates, and every screen loads quickly, so that the API is usable and fast.                                                | Mahlatse                     |     M3      |
|  6  | As an **admin**, I see an attempt refused and flagged when a player answers two events faster than anyone could walk between them, so that teleporting cheats are caught.                                                                                   | Oratile                      |     M3      |
|  7  | As a **player** whose GPS is too weak indoors, I can scan a QR code at the landmark to prove I'm there, so that poor signal doesn't lock me out.                                                                                                            | Oratile                      |     M3      |
|  8  | As an **admin**, I see a suspicious player's trust score change what they can do step by step (stricter checks → rewards held for review → no cards, ranked or trading), so that the response fits what they did rather than a single ban.                  | Oratile                      |    Final    |
|  9  | As an **admin**, I can create achievements in the console (name, icon, description and a rule such as "win 10 battles" or "keep a 7-day streak"), and players unlock them automatically with a pop-up, so that new goals can be added without code changes. | Kgothatso                    |     M3      |
| 10  | As an **admin**, I see pass rates for each question and whether each card rarity is dropping at the intended rate, so that I can tune the game.                                                                                                             | Kgothatso                    |     M3      |
| 11  | As a **player**, my daily streak grows when I play on consecutive days, resets when I miss one, and boosts my XP, so that I have a reason to come back every day.                                                                                           | Kgothatso                    |     M3      |
| 12  | As a **player or admin on a phone**, every screen fits a 360-pixel screen, is readable, and works with a screen reader, so that the game is comfortable and usable for everyone.                                                                            | Rea                          |     M3      |
| 13  | As an **admin**, I send new content for review and a second admin approves it before players see it, so that mistakes don't go live.                                                                                                                        | Rea                          |     M3      |
| 14  | As an **admin**, I schedule a campaign (a term, an open day) with start and end dates, and its events go live and retire by themselves, so that I don't switch them by hand.                                                                                | Rea                          |     M3      |
| 15  | As an **admin**, I see questions that almost everyone gets wrong flagged as "Needs repair" in Curation, so that I can fix them.                                                                                                                             | Rea                          |     M3      |
| 16  | As a **student tester**, I try the game in a short session, give feedback on a form, and see my complaints fixed in the next version, so that the game is shaped by real users.                                                                             | Rea                          |     M3      |
| 17  | As a **player**, I can offer cards to another player for some of theirs, and the swap completes for both of us or not at all, within fair limits, so that I can trade safely.                                                                               | Junior                       |     M3      |
| 18  | As a **player**, the server only accepts requests from our app and logged-in users, so that nobody can read or change game data from outside.                                                                                                               | Junior                       |     M3      |
| 19  | As a **player**, the map points me to the nearest event I haven't done yet and draws the walking route to it, so that I always know where to go next.                                                                                                       | Junior                       |     M3      |
| 20  | As a **team**, every push runs the tests and blocks the merge below 60% coverage, and every bug is logged and tracked, so that quality is provable.                                                                                                         | Junior                       |     M3      |
| 21  | As an **admin**, I let the game place events across campus by itself (on walkable paths, spread out, rotated, no area left empty), so that I don't place every event by hand.                                                                               | Junior                       |    Final    |
| 22  | As a **player**, I can scrap a duplicate card for Essence or combine duplicates to level a card up, so that duplicates are worth something.                                                                                                                 | Nontokozo                    |     M3      |
| 23  | As a **player**, I can follow a quest trail of events in order and earn a bonus card at the end, so that exploring has a goal.                                                                                                                              | Nontokozo                    |     M3      |
| 24  | As a **player**, I find real campus content in the game (many events, questions and cards), not test data, so that the game feels finished.                                                                                                                 | Nontokozo                    |     M3      |
| 25  | As a **player**, I can join a ranked queue, get matched with someone of similar Elo, and climb a ladder that resets each season, so that competitive play is fair and fresh.                                                                                | Nontokozo                    |    Final    |
| 26  | As a **player**, I can earn influence in a campus zone and take it over from other players, and the map shows who holds each zone live, so that campus becomes contested.                                                                                   | Nontokozo                    |    Final    |
| 27  | **All project documentation.**                                                                                                                                                                                                                              | Kgothatso & Oratile (shared) | M3 + Final  |

## 2. Who Does What

### Mahlatse: Check-ins, Battles & API

1. **Location check on the server (M3, by Thu 24 Sep; others depend on it).**
   - The phone sends its position with every answer, and the server refuses it if the player is outside the event's radius or time window.
   - Lock down `/trivia/checkin` (it currently gives any card to anyone) and delete the unguarded routes in `server.ts`.
   - Files: `utils/presence.ts` (new), `content.ts`, `TriviaModal.tsx`. (F1, F3, F4)
2. **Offline "as at the time" (M3).** Queued answers save their position and time. The server judges them against that, not where the player is now. Files: `offlineQueue.ts`. (F43)
3. **Server CPU battles (M3).** The phone only sends the chosen stat. The server plays the rounds, decides the winner and pays out rewards. Files: `battle.ts`, `battleResolution.ts`, `BattleArena.tsx`. (F2, F31)
4. **Spectate (M3).** A "Watch" button on live matches, plus a full two-phone test of live PvP.
5. **API design and performance (M3) — rubric: API 20%, Performance 5%.**
   - Audit every endpoint: correct HTTP method, sensible paths, no duplicate or leftover routes, one error format, proper status codes.
   - Version the API under `/api/v1` and keep the old paths working.
   - Measure and fix the slow parts: the trust-score endpoint queries the database twice per player, and the analytics endpoints read up to 5000 rows each.
   - Record before-and-after timings for the demo and hand the endpoint list to Kgothatso and Oratile for the API reference.

### Oratile: Anti-Cheat

1. **Walking-time check (M3).** If two answers come faster than the walk between the events allows, the second is refused and flagged. It builds on Mahlatse's location check.
2. **QR proof (M3).** When GPS is too poor to trust, the player scans a QR code placed at the landmark instead. Admins print each event's code from the console.
3. **Trust responses (Final).**
   - Low trust leads to stricter checks, then rewards held for an admin to approve, then no cards, ranked or trading. It's never a single ban.
   - Also count answers sent twice, and accounts that only play each other.

### Kgothatso: Achievements, Analytics & Streaks

1. **Admin-created achievements (M3).**
   - Admins create achievements in the console by picking a rule type (cards collected, battles won, level reached, events completed, streak days, trail finished), a target number, a name and an icon.
   - The server checks the rules after every answer and match, and players get a pop-up when one unlocks.
   - This replaces the hard-coded list in `utils/achievements.ts` and removes the two badges everyone gets at sign-up.
2. **Analytics (M3).** Pass rates per **question**, and card drop rates compared with the intended rate for each rarity, on the Analytics screen. Rea's "Needs repair" flag uses the per-question numbers.
3. **Streaks (M3).** Consecutive days grow the streak and a missed day resets it. XP is multiplied ×1.10 at 3 days and ×1.25 at 7. (F28, F38)

### Kgothatso & Oratile (shared): Documentation — rubric: Documentation 15%

All project documentation is solely yours, and it carries 15% of the Milestone 3 mark on its own. It must cover **features, API, database and testing**, plus the evidence for methodology, stakeholder and user feedback that other criteria are marked on.

### Rea: Mobile UI, Curation & User Testing

1. **Mobile-friendly and accessible app (M3 for current screens, Final for new ones) — also rubric: Accessibility, Aesthetics, Responsiveness (M4).**
   - Every screen works at 360 px wide: no sideways scrolling, tap targets at least 44 px, no zoom-on-typing on iPhone.
   - The admin console is the main job, and a "More" menu makes every screen reachable.
   - Accessibility: contrast ratios, semantic HTML, ARIA labels on icon-only buttons, and keyboard and screen-reader checks.
   - Sign off every new screen before it merges. Test on a real Android and a real iPhone. (F16, F53)
2. **Review step (M3).** Draft → pending review → published. A second admin must approve, and nobody approves their own item.
3. **Real campaigns (M3).** Campaigns (a term, an open day) get saved start and end dates, and their events go live and retire by themselves.
4. **"Needs repair" questions (M3).** Curation flags questions that almost everyone gets wrong, using Kgothatso's per-question rates. Editing a question resets its stats.
5. **User testing (M3) — rubric: User Feedback 10%, Improvement 5%.**
   - Run **two rounds** of sessions with at least 8 students who aren't on the team: one round this week, one after the fixes.
   - Use a set script (sign up, walk to an event, answer, battle, trade) and a short Google Form: what was confusing, what broke, rate each screen 1–5.
   - Log every finding in the bug tracker, fix what you can before 29 Sep, and keep a "you said → we changed → commit" list for the demo. Hand it to Kgothatso and Oratile for the docs.

### Junior: Trading, Map, Security & Quality

1. **Trading (M3).**
   - Each player offers cards, and the swap completes for both or not at all, in one database transaction.
   - Limits stop anyone funnelling cards into one account: a daily cap, fair value, and no new or low-trust accounts. (F22)
2. **Security and API availability (M3).** Lock CORS to our own sites, put a login check on the last public telemetry route, and make sure the deployed API is reachable for the external-usage mark. (F10)
3. **"Next stop" with walking directions (M3) — also rubric: external integration (M4).**
   - The map points to the nearest active event you haven't done, or the next trail step, with distance and direction.
   - Draw the actual walking route using an external routing API (OpenRouteService or similar), cached and with a straight-line fallback, so the integration is part of the feature rather than bolted on.
4. **Testing gate and bug tracker (M3) — rubric: Automated Testing 10%, Tools (M4).**
   - CI reports coverage for both code bases and fails under **60%** (the rubric's advanced band), rising to 80% for the final submission.
   - Make sure every new feature ships with API tests (supertest) and UI tests (React Testing Library). Chase the gaps.
   - Set up the bug tracker properly: labels, severity, "found in user testing", and a link from every bug to its fix commit.
5. **Automatic event placement (Final).**
   - The game places events on walkable paths, kept apart, with a sensible number live, rotated over time, and no area left empty for long.
   - Admins run it from the console.

### Nontokozo: Cards, Trails, Content, Ranked & Territory

1. **Card Forge (M3).** Scrap a duplicate for Essence, or spend 2 duplicates + 100 Essence to level a card up (+5 on every stat). It runs on the server, so a double tap can't spend twice. (F20, F40)
2. **Quest trails (M3).** Admins chain events into a trail. Players must do the steps in order, and finishing pays a bonus card once. (F21)
3. **Real campus content (M3) — rubric: Data (M4).**
   - Fill the live database with real content through the admin console: at least 20 events at real landmarks, 40 questions about Wits alumni, history and landmarks, and 30 cards with artwork.
   - Delete leftover test rows and dummy accounts so the production database is real data, not testing junk.
   - The team can help write questions; you own the result.
4. **Ranked + seasons (Final).**
   - A queue that pairs players of similar Elo. Only ranked matches change Elo.
   - Seasons archive the ladder and soft-reset ratings.
   - Pair with Mahlatse on the live PvP socket code. (F19)
5. **Territory (Final).**
   - Campus is split into zones. Answering and winning battles inside a zone earns influence, and the player with the most influence holds it.
   - The server settles simultaneous moves in one place, and the map updates live. (F23)

### Everyone

- Write tests with your feature, in the same PR.
- Log every bug you find in the tracker, including ones from user testing.
- Follow the git methodology: a branch per task, a PR with a description and a reviewer, no direct pushes to `main`.
- Move your card on the sprint board the day you start and the day you finish. The board is the evidence for the methodology mark.
- Be at the daily stand-up. Kgothatso and Oratile keep the notes.

## 3. Rubric Coverage (Milestone 3)

| Criterion                  | Weight | What we show on 29 Sep                                                                    | Who                                                                       |
| :------------------------- | :----: | :---------------------------------------------------------------------------------------- | :------------------------------------------------------------------------ |
| **User Feedback**          |  10%   | Two rounds of testing with 8+ students, a feedback form, findings logged, changes shipped | Rea (everyone helps run sessions)                                         |
| **Automated Testing**      |  10%   | Over 60% coverage on both code bases, with API tests and UI tests, enforced in CI         | Junior (gate); everyone writes tests                                      |
| **Feature Implementation** |  20%   | Stories 1–26 working, with no severe bugs                                                 | Everyone                                                                  |
| **API Implementation**     |  20%   | Every endpoint working, consistent design, versioned, documented, reachable from outside  | Mahlatse (design), Junior (availability), Kgothatso & Oratile (reference) |
| **Performance**            |   5%   | Measured page and API timings, with the slow endpoints fixed                              | Mahlatse                                                                  |
| **Improvement**            |   5%   | A "you said → we changed → commit" list from testing and lecturer feedback                | Rea + Kgothatso & Oratile                                                 |
| **Documentation**          |  15%   | MkDocs site covering features, API, database and testing, with no broken links            | Kgothatso & Oratile                                                       |
| **Project Methodology**    |  15%   | Sprint board history, stand-up and meeting notes, git flow in the PR history, burndown    | Everyone; evidence compiled by Kgothatso & Oratile                        |

**Carried into Milestone 4 (11 Oct):** accessibility, aesthetics, UX and responsiveness (Rea); database structure, deployment and real data (Nontokozo + Mahlatse); API architecture, deployment and load performance (Mahlatse + Junior); coverage above 80% (everyone); the external API integration (Junior); project and bug tracker evidence (Junior).

## 4. Key Dates

| Date                | What                                                                    |
| :------------------ | :---------------------------------------------------------------------- |
| **Wed 23 Sep**      | Today: tasks claimed, branches cut, first user-testing round booked.    |
| **Thu 24 Sep**      | Server location check merged.                                           |
| **Fri 25 Sep**      | First user-testing round run. Findings in the tracker by the evening.   |
| **Sat 26 Sep**      | All M3 features in review. Coverage at 60% in CI.                       |
| **Sun 27 Sep**      | Fixes from testing round 1. Docs site building with no broken links.    |
| **Mon 28 Sep**      | Second testing round, performance timings taken, demo script rehearsed. |
| **Tue 29 Sep**      | **Milestone 3 demo.**                                                   |
| **30 Sep → 11 Oct** | Final tasks, coverage to 80%, polish, submission.                       |

## 5. Done Means

- Tests ship in the same PR, and CI is green (lint, `tsc`, coverage ≥60%, builds).
- Merged through a reviewed PR that cites its fix IDs and its bug-tracker items.
- Any database change ships as a file in `docs/database/migrations/`, and Mahlatse has run it.
- Rea has ticked **mobile-checked**.
- The docs page for it is updated.
- It works on a real phone on campus.
