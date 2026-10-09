# Third-Party Code & Services

Every library, framework, and external service the project depends on, verified against the actual `package.json` manifests of the [source repo](https://sdp.ms.wits.ac.za/big-o/Wits-Quest) (frontend, backend, and root). Written to satisfy the brief's third-party code documentation requirement — for the *reasoning* behind the bigger architectural choices, see [Technical Decisions](technical-decisions.md).

Checked against the code on `main` (last changed 1 October 2026). Licences were read from each installed package on 8 October 2026.

!!! info "Licences"
    Almost every dependency uses a permissive open-source licence (MIT, Apache-2.0, ISC or BSD). The one exception is **react-leaflet**, which uses the **Hippocratic License 2.1**: free to use, but with ethical conditions on how the software may be used. A student campus game meets those conditions, but it isn't a standard open-source licence, so we note it here. The only API key we use is a free OpenRouteService key for walking directions.

!!! note "Sprint 2 auth migration"
    The biggest third-party change in Sprint 2: authentication moved from a hand-rolled JWT + bcrypt + nodemailer stack to **Supabase Auth**. `jsonwebtoken`, `bcrypt`, and `nodemailer` were removed from the backend entirely — the backend now *verifies* Supabase-issued tokens rather than minting its own, and Supabase delivers the email OTPs. See the migration plan in the source repo (`personal/supabase-auth-migration-plan.md`).

---

## Frontend dependencies

From `frontend/package.json`:

| Dependency | Version | Licence | Role | Why this one |
| :--- | :--- | :--- | :--- | :--- |
| **react** / **react-dom** | ^18.2.0 | MIT | UI framework | Component model fits the screen-per-feature architecture; the team had existing experience with it |
| **typescript** | ^5.2.2 | Apache-2.0 | Type safety across both packages | Shared `Card`/`BattleState` types between engine, screens, and backend payloads catch contract drift at compile time |
| **vite** | ^5.4.14 | MIT | Dev server & production bundler | Fast HMR for a map-heavy PWA; first-class TypeScript support |
| **leaflet** + **react-leaflet** | ^1.9.4 / ^4.2.1 | BSD-2-Clause / Hippocratic-2.1 | Campus map rendering | Open-source renderer that displays Wits campus maps **without paid Google Maps API keys** — an explicit Sprint 1 decision ([SPRINT1.md](../sprints/SPRINT1.md)) |
| **lucide-react** | ^0.344.0 | ISC | Icon set | Tree-shakeable SVG icons for the bottom nav, top bar, and screen chrome |
| **canvas-confetti** | ^1.9.2 | ISC | Unlock/celebration animations | Lightweight particle effects for card-unlock moments; mocked in the test suite rather than snapshot-tested |
| **html5-qrcode** | ^2.3.8 | Apache-2.0 | QR scanner | Lets players scan an event's printed QR code with the phone camera when GPS is too weak |
| **qrcode** | ^1.5.4 | MIT | QR generator | Draws the QR code admins print for each event |
| **socket.io-client** | ^4.8.3 | MIT | Live PvP WebSocket client | Matches the backend's Socket.IO server for turn timers and synchronized two-player state |
| **@supabase/supabase-js** | ^2.112.3 | MIT | Supabase Auth client + database access | Talks to Supabase Auth directly from the browser using the **anon key** (sign-up, sign-in, session refresh); never sees the service-role key |

**Frontend dev dependencies:** `vitest` ^1.6.0 + `@vitest/coverage-v8`, `@vitejs/plugin-react` ^4.3.4, `jsdom` ^24, `@testing-library/react` / `-dom` / `-user-event` / `-jest-dom`, `fake-indexeddb` ^6.2.5 (stands in for the browser IndexedDB the offline queue uses in tests), and type packages (`@types/*`).

## Backend dependencies

From `backend/package.json`:

| Dependency | Version | Licence | Role | Why this one |
| :--- | :--- | :--- | :--- | :--- |
| **express** | ^4.18.3 | MIT | API server (Node.js 20) | Minimal, well-understood HTTP layer; matches the team's JavaScript stack |
| **socket.io** | ^4.7.4 | MIT | Live PvP transport | Turn timers, synchronized two-player state, and reconnection handling need bidirectional low-latency messaging that REST polling can't deliver cleanly |
| **@supabase/supabase-js** | ^2.112.3 | MIT | Database + Auth + Storage client | Direct PostgreSQL access (**no ORM**, hand-written SQL with quoted camelCase column names — see [Database Plan](../database/database-plan.md)); the service-role client also verifies Supabase Auth tokens and uploads card images |
| **ws** | ^8.21.3 | MIT | WebSocket transport for Supabase Realtime | `supabase-js` needs a WebSocket library to run in Node.js. The client is set up with it, but the app doesn't subscribe to any Realtime feeds; live updates go through Socket.IO |
| **cors** | ^2.8.5 | MIT | Cross-origin policy | Frontend (Vercel) and backend (Render) live on different origins |
| **dotenv** | ^16.4.5 | BSD-2-Clause | Environment configuration | Loads `SUPABASE_URL` / `SUPABASE_KEY` per environment without hardcoding |
| **multer** | ^2.3.0 | MIT | Multipart uploads | Card image upload from the authoring console (5 MB limit) into Supabase Storage |

**Backend dev dependencies:** `vitest` ^1.6.0 + `@vitest/coverage-v8`, `supertest` ^7.2.2 (API tests against a mocked Supabase), `socket.io-client` ^4.8.3 (tests the live battle socket events), `tsx` ^4.7.1, `typescript` and type packages (`@types/*`).

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
| **OpenRouteService** | Walking directions (external API) | The backend calls its Directions API (`foot-walking`) to draw the route to the next event; the API key stays on the server. Routes are cached for an hour |
| **FOSSGIS walking router** (`routing.openstreetmap.de`) | Backup walking directions | Used when OpenRouteService fails (quota used up, rate limited or down). Free OpenStreetMap service with no key and no daily quota; the backend reshapes its answer to match OpenRouteService. Route data © OpenStreetMap contributors (ODbL) |
| **Gitea** (`sdp.ms.wits.ac.za`) | Source control + CI | University-hosted. `.gitea/workflows/ci.yml` runs lint, type-check and both test suites on demand; `sync-mirrors.yml` copies the frontend and backend into their own repos |
| **GitHub Actions** | Deployment | On every push to `main`, deploys the app to Vercel and the API to Render |
| **GitHub Pages** | This documentation site | MkDocs Material build, deployed from the docs workflow |
| **OpenStreetMap** | Map tiles | The campus map in the app and in the admin event editor loads its tiles from `tile.openstreetmap.org`, with the required "© OpenStreetMap contributors" credit on the map. Map data is under the ODbL licence |
| **Google Fonts** | Fonts | The app loads Outfit, Shippori Mincho B1 and Caveat from Google Fonts. All three use the SIL Open Font License |
| **unpkg** (CDN) | Map styles | `index.html` loads Leaflet's stylesheet (`leaflet@1.9.4/dist/leaflet.css`) from unpkg |
| **jsDelivr** (CDN) | Swagger UI | The API's [Swagger UI](swagger.md) page loads `swagger-ui-dist@5` (Apache-2.0) from jsDelivr, so nothing extra is installed on the server |
| **Google Forms** | User feedback survey | The [feedback form](../project/user-feedback.md) used for the Sprint 2 user-feedback cycle |
| **Discord** and **Google Meet** | Team and client meetings | Team meetings run on the Big-O Discord server; client meetings on Google Meet ([Meeting Records](../meetings/index.md)) |
| **Google PageSpeed Insights** / **Lighthouse** | Performance and accessibility audits | Used for the [Performance](performance.md) measurements |
| **Figma** | Design workspace | The design system (parchment/gold/navy palette, typography) that this documentation site's theme mirrors |

### How Supabase is used

| Subsystem | Used by | What it does |
| :--- | :--- | :--- |
| **Postgres 15** | Backend (service-role client) | The single source of truth — players, cards, decks, events, trivia, battles. Hand-written SQL, protected by row-level security |
| **Auth** | Frontend (anon key) + backend (service-role verification) | Frontend calls `supabase.auth.signUp/signIn` directly; the backend's auth middleware verifies each request's bearer token with `supabase.auth.getUser()` — the backend never mints tokens or sends email. OTP codes are delivered by Supabase's managed email service |
| **Storage** | Backend (multer → service-role client) | Card images uploaded from the authoring console land in the `card-images` bucket |
| **Realtime** | Not used | The backend client is configured with the `ws` transport, but no Realtime channels are subscribed. Live battles and online players use our own Socket.IO server instead |

## Documentation tooling

| Tool | Role |
| :--- | :--- |
| **MkDocs** + **Material for MkDocs** 9.5 | This site — static docs with search, navigation, and admonitions, themed with the app's own color palette |
| **Mermaid** | Architecture and workflow diagrams rendered inline |

---

## Deliberate non-dependencies

These are as much a part of the third-party story as what we *do* use:

- **No ORM** — all database access is hand-written SQL through the Supabase client, keeping queries explicit and reviewed.
- **No paid map tiles** — Leaflet + OpenStreetMap tiles instead of Google Maps.
- **No in-memory mock database** — `mockDb.ts` (a pre-Sprint-2 local fallback) was deleted once the Supabase-only approach settled; tests mock Supabase directly instead.
- **No hand-rolled auth crypto** — since the Supabase Auth migration there is no password hashing, JWT signing, or OTP-email code of our own to maintain; the backend only *verifies* tokens. (Sprint 1 *did* run a custom JWT + bcrypt + nodemailer stack — the [decisions log](decisions-log.md) records why it was replaced.)
- **No backend-as-a-service API** — every REST route and Socket.IO event is hand-written Express/TypeScript code; Supabase is a database and auth provider, never an API generator.

## Attribution notes

- **Map data** is © OpenStreetMap contributors, shown on every map as their licence requires.
- The **Haversine formula** used for the distance check is standard public-domain spherical-trigonometry mathematics — implemented in-house, not copied from a library.
- **Game content** — campus landmark trivia, card definitions, and stat values — is original team-authored material. Wits campus coordinates are factual data.
- Battle rules, engine logic, and the Kudu CPU AI are original implementations, documented in the [CPU Battle Rules](cpu-battle-rules.md) rulebook.
