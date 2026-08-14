# Architecture

## Repository shape

Wits Quest is a monorepo with a root orchestration `package.json`:

```json
{
  "scripts": {
    "dev:frontend": "npm --prefix frontend run dev",
    "dev:backend": "npm --prefix backend run dev",
    "install:all": "npm --prefix frontend install && npm --prefix backend install"
  }
}
```

```
wits-quest/
├── frontend/     # PWA client
├── backend/      # API server
├── docs/         # this MkDocs site
├── mkdocs.yml
└── package.json  # root orchestration scripts
```

Run `npm run install:all` once to install both workspaces, then `npm run dev:frontend` / `npm run dev:backend` in separate terminals during development.

## Feature-to-file map

This mirrors the team's domain ownership in [Scope](../project/scope.md), listing the concrete screen/module each feature lives in.

### Map & Location

- **`MapExplorer.tsx`** — primary gameplay hub: GIS map, landmark events, GPS fix, distance calc, nearby player avatars. Owner: Member 1.
  - Distance check uses the **Haversine formula** between user GPS `(lat1, lon1)` and landmark `(lat2, lon2)`:
    `d = 2r · arcsin(√(sin²((lat2−lat1)/2) + cos(lat1)·cos(lat2)·sin²((lon2−lon1)/2)))`
  - States: **IN RADIUS** (`d ≤ 25m`, trivia unlocks) vs **OUT OF RANGE** (`d > 25m`, event locked).

### Trivia & Cards

- **`TriviaModal.tsx`** — location-gated trivia UI. Owners: Members 3 & 5.
- **`CardCollection.tsx`** — inventory gallery. Owner: Member 5.

### Combat

- **`DeckBuilder.tsx`** — deck construction (5 cards, 300 stat cap, 1 Legendary cap). Owner: Member 5.
- **`BattleArena.tsx`** — turn-based CPU battles. Owner: Member 2.
- **`AsyncPvP.tsx`** — turn-based async challenges. Owner: Member 2.
- **`LivePvPArena.tsx`** — real-time WebSocket battles. Owner: Member 2.

### Progression, Economy & Social

- **`Leaderboard.tsx`** — campus rankings. Owner: Member 5.
- **`QuestTrails.tsx`** — sequential landmark chains. Owner: Member 5.
- **`Trades.tsx`** — peer card trading. Owner: Member 5.
- **`CardForge.tsx`** — card crafting/upgrading. Owner: Member 5.
- **`TerritoryMap.tsx`** — zone control. Owner: Member 6.
- **`RankedMatchmaking.tsx`** — Elo-based matchmaking, plus the velocity trajectory anti-cheat engine. Owner: Member 6.

### Auth & Offline

- **`Login.tsx`**, ServiceWorker, IndexedDB, custom JWT auth. Owner: Member 3.

### Admin Console

- **`AdminEvents.tsx`** — spatial event placement.
- **`AdminContent.tsx`** — question & card authoring.
- **`AdminCuration.tsx`** — curation/review governance.
- **`AdminAntiCheat.tsx`** — anti-cheat audit log.
- **`AdminAnalytics.tsx`** — campus heatmaps & telemetry.

All owned by Member 4.

## Data layer

See [Database Plan](../database/database-plan.md) and [Database Schema](../database/database-schema.md) for the full entity design (`users`, `cards`, `user_cards`, `user_decks`, `battle_matches`, `async_pvp_challenges`).
