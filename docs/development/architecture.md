# Development Architecture

How the code is organised and where each feature lives. For the big-picture diagram, see [System Architecture](../uml/01_system_architecture.md).

---

## Repository layout

The source code is one repo (`Wits-Quest` on Gitea) with the frontend and backend side by side:

```
Wits-Quest/
├── frontend/          React app (Vite + TypeScript)
│   └── src/
│       ├── screens/   one file per screen, admin screens in screens/admin/
│       ├── components/
│       ├── services/  API calls, offline queue, card catalogue
│       └── utils/     battle engine, anti-cheat helpers, event states
├── backend/           Express API + Socket.IO (TypeScript)
│   └── src/
│       ├── routes/    one file per area (auth, content, battle, trades, ...)
│       ├── services/  live battle sockets, decks, event placement
│       ├── utils/     battle rules, streaks, achievements, anti-cheat
│       └── middleware/ login check, admin check, trust check
├── docs/database/migrations/   SQL changes, run in Supabase
└── package.json       shared lint and format tools
```

Run it locally:

```bash
npm --prefix frontend install && npm --prefix backend install
npm --prefix backend run dev     # API on http://localhost:3000
npm --prefix frontend run dev    # app on http://localhost:5173
```

---

## The app's six tabs

| Tab | What the player does | Main screens |
| :--- | :--- | :--- |
| **Map** | See where they are and which events are in reach, answer trivia | `MapExplorer.tsx`, `TriviaModal.tsx` |
| **Cards** | Browse their collection, build a deck, forge duplicates, trade | `CardCollection.tsx`, `CardForge.tsx`, `Trades.tsx` |
| **Quests** | Follow trails of events in order, take campus zones | `QuestTrails.tsx`, `TerritoryMap.tsx` |
| **Battle** | Play the computer, a live match, an async match or ranked, or watch a match | `BattleArena.tsx`, `LivePvPArena.tsx`, `AsyncPvP.tsx`, `RankedMatchmaking.tsx`, `SpectateArena.tsx` |
| **Ranks** | See the leaderboard | `Leaderboard.tsx` |
| **Me** | Profile, level, streak, achievements, theme, avatar | `Profile.tsx`, `Appearance.tsx`, `BattleHistory.tsx` |

Admins also get a **console** (`screens/admin/`): Events, Content (questions and cards), Curation (draft → review → published → retired), Campaigns, Progression (achievements and trails), Anti-Cheat and Analytics.

---

## Who owns what

| Member | Area | Main code |
| :--- | :--- | :--- |
| Junior | Map, location, walking directions and trading | `MapExplorer.tsx`, `routes/routing.ts`, `routes/trades.ts` |
| Mahlatse | Battles (CPU, live, async, spectate) | `BattleArena.tsx`, `LivePvPArena.tsx`, `services/battleSocketHandler.ts`, `utils/battleResolution.ts` |
| Kgothatso | Database, API, login, achievements and streaks | `routes/auth.ts`, `middleware/auth.ts`, `routes/adminAchievements.ts`, `utils/streak.ts` |
| Rea | Admin console, content curation and automatic event placement | `screens/admin/AdminCuration.tsx`, `routes/content.ts`, `services/eventPlacementService.ts` |
| Nontokozo | Cards, forge, trails, territory and ranked seasons | `CardCollection.tsx`, `routes/forge.ts`, `routes/trails.ts`, `routes/territory.ts`, `routes/ranked.ts` |
| Oratile | Anti-cheat, QR check-in and analytics | `AdminAntiCheat.tsx`, `AdminAnalytics.tsx`, `routes/telemetry.ts`, `routes/qrCheckin.ts` |

Several features were finished together, so many files have commits from more than one person.

---

## Key rules in the code

- **The server decides.** Location checks, trivia marking, battle rounds and rewards all happen on the backend. The app only sends the player's choices.
- **Location is a claim.** When a player answers, the server checks their last reported position is inside the event's radius and time window. If GPS is weak, they can scan the event's QR code instead.
- **Offline answers wait.** Without signal, answers are saved on the phone (IndexedDB) and sent when the connection returns. The server judges them by the time and place they were made.
- **Decks have limits.** 5 cards, at most 1 Legendary, and a total stat budget of 2000.

## Data

The database tables are described in [Database Schema](../database/database-schema.md).
