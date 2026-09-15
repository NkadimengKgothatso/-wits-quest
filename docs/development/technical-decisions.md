# Technical Decisions

A running log of the significant technical choices behind Wits Quest and the reasoning for them. Add a new entry whenever a non-obvious decision is made, so future contributors don't have to reverse-engineer _why_.

## Authentication: Supabase Auth, replacing custom JWT

**Decision**: Sprint 2 retired the custom JWT authentication from Sprint 1 (bcrypt password hashing, `jsonwebtoken` token signing, `nodemailer` email verification) and migrated to **Supabase Auth**. The frontend signs in through `supabase.auth.*` with the anon key; the backend verifies every request by resolving the bearer token via `supabase.auth.getUser()` with the service-role key. `jsonwebtoken`, `bcrypt`, and `nodemailer` were fully removed from the backend manifest.
**Why**: The Sprint 1 tutor review flagged exactly what was wrong with hand-rolled password handling — bcrypt hashes are not hard to crack offline once a database leaks, and a six-person student team re-implementing token issuance, expiry, and email verification is re-learning lessons the industry solved years ago. Supabase Auth is a managed, OAuth-grade service built on industry standards: our code never touches a password hash at all, sessions and verification emails are handled by a hardened provider, and it collapsed four concerns into the one service we already ran (Postgres, Auth, Storage, Realtime) — one SDK, one key pair, zero cost on the student tier. The trade-off is vendor dependence, which is acceptable for a course project and documented in the Supabase comparison below.

## Code-quality gates: ESLint + Prettier + husky

**Decision**: Every commit passes ESLint and Prettier on staged files via a husky `lint-staged` pre-commit hook, and CI runs the full lint + typecheck + test suite on every push.
**Why**: Sprint 1 shipped with **no automated code-quality checks** — a gap called out in the tutor's Sprint 1 review. With six people committing to shared repositories, style drift and unused-variable rot compound quickly; hooks make the standard self-enforcing instead of something reviewers police by hand. Full enforcement table in [Git Workflow](git-workflow.md).

## Frontend: React (with Vite)

**Decision**: The PWA frontend is built with React 18, scaffolded by Vite.
**Why (the honest, team-specific version)**: Most of the team already had React experience from previous coursework, so React cost us zero learning time in a 15-week project — Vue or Svelte would have meant learning the framework *while* building the game. React's component model also maps one-to-one onto how we split the work: each of the six members owns a vertical domain end-to-end (map, battles, auth, admin console, collection, telemetry), and a domain is naturally a self-contained tree of components one person can own. And the ecosystem had ready-made bindings for our exact stack — `react-leaflet` for the campus map, `socket.io-client` for live PvP, `@supabase/supabase-js` for auth and data, `vite-plugin-pwa` for offline support — so we assembled rather than invented. **Alternatives rejected:** Vue (nobody had shipped with it), Angular (too much ceremony for our timeline).

## Backend runtime: Node.js + Express

**Decision**: The API and WebSocket server run on Node.js with Express.
**Why (the personal version)**: One language across the whole stack. Everything is TypeScript, so the shared game types (`Card`, `BattleState`, round structures) are defined once and used by both the React client and the Express server — for a team juggling five other courses, not context-switching between JavaScript and Python/Java every afternoon was a real, felt productivity gain. Node is also simply the best real-time story in town: live PvP is bidirectional WebSockets (`ws` + Socket.IO), which Node handles natively, and the npm ecosystem contained every piece we needed (Express routing, Multer uploads, Supabase SDK). Deploying the same runtime to Render was one command. **Alternatives rejected:** Python/FastAPI (splits the languages, weaker shared-type story), Java/Spring (course-project ceremony, slower iteration).

## Backend-as-a-service: Supabase (vs the competition)

**Decision**: Postgres, authentication, file storage, and realtime channels all come from Supabase.
**Why**: We compared the realistic options before committing:

| Option | What it offers | Why we chose Supabase over it |
| :--- | :--- | :--- |
| **Firebase** | Auth, Firestore (NoSQL), Storage | Firestore is document-shaped; our domain — users, cards, decks, battles, events, telemetry, foreign keys, aggregate leaderboards — is deeply relational. Plain SQL is what the database course trained us on, so a Supabase schema reads like the ERDs we drew for this project. Also full Google lock-in. |
| **Auth0** | Best-in-class auth only | Solves auth and nothing else — we would still need a hosted Postgres, a storage bucket, and a realtime channel from two more vendors, each with its own free-tier limits and keys to manage. |
| **Self-hosted Postgres + custom auth** (our Sprint 1 setup) | Total control | Meant being our own security team — the exact risk the tutor's review flagged — plus nobody to run migrations and backups at 2 a.m. mid-sprint. This is the setup we migrated *away* from. |
| **Supabase** | Postgres 15 + row-level security, Auth, Storage, Realtime | One service covering four jobs with one SDK and one anon/service key pair. It is plain Postgres underneath — portable, no lock-in, open source — and the free tier comfortably covers a course project. |

The clincher for a student team: one free tier instead of stitching three together, and the auth migration (above) meant we stopped writing security-critical code entirely.

## Map rendering: Leaflet + react-leaflet, not MapBox

**Decision**: The campus map uses open-source Leaflet with `react-leaflet` bindings over OpenStreetMap tiles.
**Why**: MapBox — the alternative raised in the tutor's Sprint 1 review — was seriously evaluated and rejected for this project. MapBox delivers gorgeous custom-styled and satellite tiles, but it is a metered, API-keyed commercial service: usage caps on the free tier, a billing account, and key-management risk for a student project. Wits Quest's map is a **functional instrument, not a visual showpiece** — the game loop needs accurate campus coordinates, the 25 m geofence circle, and landmark markers, all of which Leaflet renders for free with no account at all. The parchment/cartography look is achieved with CSS overlays on standard tiles. **Re-entry criteria:** if a later sprint wants satellite imagery or fully custom game-world tiles, MapBox GL JS is the documented upgrade path — the `react-leaflet` component boundaries isolate the map well enough that the swap is contained.

## Delivery format: PWA, not native

**Decision**: Ship as a Progressive Web App rather than native iOS/Android apps.
**Why**: Students need to install nothing to try it, it works across platforms with one codebase, and it still supports the offline/service-worker requirements from the Intermediate tier.

## Location is a claim, not a fact

**Decision**: Every GPS report from the client is treated as unverified input, checked against distance thresholds and (at the Intermediate tier) movement history before being trusted.
**Why**: A card is only worth collecting if it had to be walked to — trusting client-reported GPS outright would let anyone spoof a location and defeat the entire premise of the game. See [Architecture § Map & Location](architecture.md#map--location) for the Haversine radius check, and Requirements → Intermediate for movement-history anti-spoofing.

## Server-authoritative trivia and combat

**Decision**: Trivia answers are marked server-side, and match rules (round resolution, XP/Essence awards) are enforced server-side — never trusted from the client.
**Why**: Same integrity principle as location — a player's device has every incentive to lie about winning.

## Offline-first check-ins

**Decision**: A trivia attempt made without connectivity is queued on-device (IndexedDB) via a service worker and reconciled against the backend once the connection returns, validated as if it happened at capture time.
**Why**: Campus buildings are a realistic dead zone for signal; the game shouldn't punish a student for being inside the Great Hall.

## Deck constraints as anti-power-creep

**Decision**: Decks are capped at exactly 5 cards, a 300-point total stat budget (scaling with player level), and at most 1 Legendary card.
**Why**: Prevents a high-level player from simply stacking 5 Legendaries and trivializing matchmaking; keeps early-game and late-game decks comparably competitive.

## Async PvP telemetry as a retention hook

**Decision**: A defeated async PvP defender receives `defenderTelemetry` — which stat attribute lost and by how much — rather than just a loss notification.
**Why**: Converts a loss into actionable feedback ("swap in a higher-SPD card"), which should reduce churn from players who lose PvP matches while offline.

## Trust scoring instead of binary bans (Advanced tier)

**Decision**: Anti-cheat responses should be proportionate (warnings, restrictions, flags for review) rather than an automatic ban on first detection, with genuinely suspicious cases routed to a human reviewer via `AdminAntiCheat.tsx`.
**Why**: The evidence (movement, submission timing, account pairing) comes entirely from a party that has a reason to lie — false positives from noisy GPS or coincidental account pairings are expected, so an instant-ban system would punish innocent players.

## Real-time match transport: WebSockets

**Decision**: Live PvP (`LivePvPArena.tsx`) uses WebSockets rather than polling.
**Owner**: Member 2.
**Why**: Turn timers, simultaneous state for both players, and spectating all need low-latency bidirectional updates that polling can't deliver cleanly.

---

_Add new entries above this line, most recent first, as decisions are made during development._
