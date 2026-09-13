# Scope

## In scope

Wits Quest is scoped as a course project (COMS3011A) delivered against the three-tier brief described in [Requirements](requirements.md). The team is building:

- A frontend PWA (`frontend/`) and a backend API (`backend/`) as a monorepo, orchestrated from the root `package.json` (`dev:frontend`, `dev:backend`, `install:all`).
- Custom JWT-based authentication (not a third-party auth provider).
- A relational database modelling users, cards, inventories, decks, matches, and async PvP state — see [Database Plan](../database/database-plan.md).
- An admin/lecturer console for content authoring, curation, anti-cheat review, and analytics.

## Out of scope (unless a tier explicitly calls for it)

- Native mobile apps — delivery is PWA-only.
- Payment or real-money systems — Essence is an in-game currency only, not monetised.
- Support for campuses other than Wits — landmarks, trivia, and geofencing are Wits-specific.

## Team domain ownership

Each of the six team members owns a vertical slice: the screens plus the logic behind them.

| Team Member  | Domain Responsibility                             | Key Screens & Modules                                                                                        |
| :----------- | :------------------------------------------------ | :----------------------------------------------------------------------------------------------------------- |
| **Member 1** | Geolocation, GIS & Spatial Engine Lead            | `MapExplorer.tsx`, GPS Verification API                                                                      |
| **Member 2** | Battle Engine, AI & Real-Time Multiplayer Lead    | `BattleArena.tsx`, `LivePvPArena.tsx`, `AsyncPvP.tsx`                                                        |
| **Member 3** | Database Architecture, Offline Sync & Auth Lead   | `Login.tsx`, ServiceWorker, IndexedDB, Custom JWT Auth                                                       |
| **Member 4** | Admin Console, Curation & Telemetry Lead          | `AdminEvents.tsx`, `AdminContent.tsx`, `AdminCuration.tsx`, `AdminAntiCheat.tsx`, `AdminAnalytics.tsx`       |
| **Member 5** | Progression Engine, Economy Systems & Trails Lead | `CardCollection.tsx`, `DeckBuilder.tsx`, `Leaderboard.tsx`, `QuestTrails.tsx`, `Trades.tsx`, `CardForge.tsx` |
| **Member 6** | Advanced Anti-Cheat, Matchmaking & Territory Lead | `TerritoryMap.tsx`, `RankedMatchmaking.tsx`, Velocity Trajectory Engine                                      |

Full per-feature detail (target files, purpose, algorithmic rules) lives in the team's internal feature handover guide and should be mirrored into [Technical Decisions](../development/technical-decisions.md) as each feature lands.

## Assumptions

- Players are current Wits students/staff with a `@students.wits.ac.za`-style email for registration.
- The game targets a single academic term/season at a time for ranked play and campaigns.

_This page is a living document — update it as scope is renegotiated with the course proposer or external brief._
