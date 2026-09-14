# Third-Party Code & Services

Every library, framework, and external service the project depends on, verified against the actual `package.json` manifests of the [source repo](https://sdp.ms.wits.ac.za/big-o/Wits-Quest) (frontend, backend, and root). Written to satisfy the brief's third-party code documentation requirement — for the *reasoning* behind the bigger architectural choices, see [Technical Decisions](technical-decisions.md).

!!! info "Licensing stance"
    All dependencies are permissively licensed open source (MIT, Apache-2.0, ISC, or BSD). No paid API keys are required anywhere in the stack — a deliberate constraint for a course project.

!!! note "Sprint 2 auth migration"
    The biggest third-party change in Sprint 2: authentication moved from a hand-rolled JWT + bcrypt + nodemailer stack to **Supabase Auth**. `jsonwebtoken`, `bcrypt`, and `nodemailer` were removed from the backend entirely — the backend now *verifies* Supabase-issued tokens rather than minting its own, and Supabase delivers the email OTPs. See the migration plan in the source repo (`personal/supabase-auth-migration-plan.md`).

---

## Frontend dependencies

From `frontend/package.json`:

| Dependency | Version | Role | Why this one |
| :--- | :--- | :--- | :--- |
| **react** / **react-dom** | ^18.2.0 | UI framework | Component model fits the screen-per-feature architecture; the team had existing experience with it |
| **typescript** | ^5.2.2 | Type safety across both packages | Shared `Card`/`BattleState` types between engine, screens, and backend payloads catch contract drift at compile time |
| **vite** | ^5.4.14 | Dev server & production bundler | Fast HMR for a map-heavy PWA; first-class TypeScript support |
| **leaflet** + **react-leaflet** | ^1.9.4 / ^4.2.1 | Campus map rendering | Open-source renderer that displays Wits campus maps **without paid Google Maps API keys** — an explicit Sprint 1 decision ([SPRINT1.md](../sprints/SPRINT1.md)) |
| **lucide-react** | ^0.344.0 | Icon set | Tree-shakeable SVG icons for the bottom nav, top bar, and screen chrome |
| **canvas-confetti** | ^1.9.2 | Unlock/celebration animations | Lightweight particle effects for card-unlock moments; mocked in the test suite rather than snapshot-tested |
| **socket.io-client** | ^4.8.3 | Live PvP WebSocket client | Matches the backend's Socket.IO server for turn timers and synchronized two-player state |
| **@supabase/supabase-js** | ^2.112.3 | Supabase Auth client + database access | Talks to Supabase Auth directly from the browser using the **anon key** (sign-up, sign-in, session refresh); never sees the service-role key |

**Frontend dev dependencies:** `vitest` ^1.6.0 + `@vitest/coverage-v8`, `jsdom` ^24, `@testing-library/react` / `-dom` / `-user-event`, and `fake-indexeddb` ^6.2.5 (stands in for the browser IndexedDB the offline queue targets in tests).

## Backend dependencies

From `backend/package.json`:

| Dependency | Version | Role | Why this one |
| :--- | :--- | :--- | :--- |
| **express** | ^4.18.3 | API server (Node.js 20) | Minimal, well-understood HTTP layer; matches the team's JavaScript stack |
| **socket.io** | ^4.7.4 | Live PvP transport | Turn timers, synchronized two-player state, and reconnection handling need bidirectional low-latency messaging that REST polling can't deliver cleanly |
| **@supabase/supabase-js** | ^2.112.3 | Database + Auth + Storage client | Direct PostgreSQL access (**no ORM**, hand-written SQL with quoted camelCase column names — see [Database Plan](../database/database-plan.md)); the service-role client also verifies Supabase Auth tokens and uploads card images |
| **ws** | ^8.21.3 | WebSocket transport for Supabase Realtime | Lets `supabase-js` receive live change feeds over WebSockets instead of polling |
| **cors** | ^2.8.5 | Cross-origin policy | Frontend (Vercel) and backend (Render) live on different origins |
| **dotenv** | ^16.4.5 | Environment configuration | Loads `SUPABASE_URL` / `SUPABASE_KEY` per environment without hardcoding |
| **multer** | ^2.3.0 | Multipart uploads | Card image upload from the authoring console (5 MB limit) into Supabase Storage |

**Backend dev dependencies:** `vitest` ^1.6.0 + `supertest` ^7.2.2 (route-level integration tests against mocked Supabase fixtures), `tsx` ^4.7.1, `typescript`.

**Removed in the auth migration:** `jsonwebtoken`, `bcrypt`, `nodemailer` — no longer present anywhere in the dependency tree. Password hashing and email OTP delivery are now Supabase Auth's job.

## Root dev tooling

From the monorepo root `package.json` — shared lint/format/commit gates:

| Tool | Version | Role |
| :--- | :--- | :--- |
| **eslint** + **typescript-eslint** | ^10 / ^8.70.0 | Lint gate (diff-scoped in CI) |
| **prettier** | ^3.9.6 | Format gate |
| **husky** + **lint-staged** | ^9.1.7 / ^16.4.0 | Pre-commit hooks — lint and format only the staged files |

## External services

| Service | Role | Notes |
| :--- | :--- | :--- |
| **Supabase** | Postgres 15 + **Auth** + Storage + Realtime | Four subsystems in one free-tier service — see the breakdown below |
| **Vercel** | Frontend hosting | Automatic builds from the main branch |
| **Render** | Backend hosting | Configured via `render.yaml` at the source-repo root; health probe at `/api/health` |
| **Gitea** (`sdp.ms.wits.ac.za`) | Source control + CI | University-hosted; native **Gitea Actions** pipelines now live (`.gitea/workflows/`): `ci.yml` (lint, typecheck, both test suites with the 80% coverage gate, production builds) and `sync-mirrors.yml` (subtree-split pushes to the frontend/backend/docs mirror repos) |
| **GitHub** | Public mirror + these docs | Source repo is mirrored to GitHub for visibility; the monorepo's `docs/` subtree is split into this repository and published to GitHub Pages |
| **GitHub Pages** | This documentation site | MkDocs Material build, deployed from the docs workflow |
| **Google Forms** | User feedback survey | The [feedback form](../project/user-feedback.md) used for the Sprint 2 user-feedback cycle |
| **Figma** | Design workspace | The design system (parchment/gold/navy palette, typography) that this documentation site's theme mirrors |

### How Supabase is used — one service, four jobs

| Subsystem | Used by | What it does |
| :--- | :--- | :--- |
| **Postgres 15** | Backend (service-role client) | The single source of truth — players, cards, decks, events, trivia, battles. Hand-written SQL, protected by row-level security |
| **Auth** | Frontend (anon key) + backend (service-role verification) | Frontend calls `supabase.auth.signUp/signIn` directly; the backend's auth middleware verifies each request's bearer token with `supabase.auth.getUser()` — the backend never mints tokens or sends email. OTP codes are delivered by Supabase's managed email service |
| **Storage** | Backend (multer → service-role client) | Card images uploaded from the authoring console land in the `card-images` bucket |
| **Realtime** | Backend (`ws` transport) | Live change feeds without polling |

## Documentation tooling

| Tool | Role |
| :--- | :--- |
| **MkDocs** + **Material for MkDocs** 9.5 | This site — static docs with search, navigation, and admonitions, themed with the app's own color palette |
| **Mermaid** | Architecture and workflow diagrams rendered inline |

---

## Deliberate non-dependencies

These are as much a part of the third-party story as what we *do* use:

- **No ORM** — all database access is hand-written SQL through the Supabase client, keeping queries explicit and reviewed.
- **No paid map tiles** — Leaflet + open tile sources instead of Google Maps.
- **No in-memory mock database** — `mockDb.ts` (a pre-Sprint-2 local fallback) was deleted once the Supabase-only approach settled; tests mock Supabase directly instead.
- **No hand-rolled auth crypto** — since the Supabase Auth migration there is no password hashing, JWT signing, or OTP-email code of our own to maintain; the backend only *verifies* tokens. (Sprint 1 *did* run a custom JWT + bcrypt + nodemailer stack — the [decisions log](decisions-log.md) records why it was replaced.)
- **No backend-as-a-service API** — every REST route and Socket.IO event is hand-written Express/TypeScript code; Supabase is a database and auth provider, never an API generator.

## Attribution notes

- The **Haversine formula** used for the 25 m geofence is standard public-domain spherical-trigonometry mathematics — implemented in-house, not copied from a library.
- **Game content** — campus landmark trivia, card definitions, and stat values — is original team-authored material. Wits campus coordinates are factual data.
- Battle rules, engine logic, and the Kudu CPU AI are original implementations, documented in the [CPU Battle Rules](cpu-battle-rules.md) rulebook.
