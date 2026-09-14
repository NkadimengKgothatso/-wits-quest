# Third-Party Code & Services

Every library, framework, and external service the project depends on, with the reason it was chosen. Written to satisfy the brief's third-party code documentation requirement — for the *reasoning* behind the bigger architectural choices, see [Technical Decisions](technical-decisions.md).

!!! info "Licensing stance"
    All dependencies are permissively licensed open source (MIT, Apache-2.0, ISC, or BSD). No paid API keys are required anywhere in the stack — a deliberate constraint for a course project.

---

## Frontend dependencies

| Dependency | Role | Why this one |
| :--- | :--- | :--- |
| **React 18** | UI framework | Component model fits the screen-per-feature architecture; the team had existing experience with it |
| **TypeScript** | Type safety across both packages | Shared `Card`/`BattleState` types between engine, screens, and backend payloads catch contract drift at compile time |
| **Vite** | Dev server & production bundler | Fast HMR for a map-heavy PWA; first-class TypeScript support |
| **Leaflet** + **React-Leaflet** | Campus map rendering | Open-source renderer that displays Wits campus maps **without paid Google Maps API keys** — an explicit Sprint 1 decision ([SPRINT1.md](../sprints/SPRINT1.md)) |
| **canvas-confetti** | Unlock/celebration animations | Lightweight particle effects for card-unlock moments; mocked in the test suite rather than snapshot-tested |
| **Vitest** + **jsdom** + **@testing-library/react** | Unit & component testing | Fast, Vite-native runner with built-in coverage gating (see [Testing](testing.md)) |

## Backend dependencies

| Dependency | Role | Why this one |
| :--- | :--- | :--- |
| **Node.js 20** + **Express** | API server | Minimal, well-understood HTTP layer; matches the team's JavaScript stack |
| **Socket.IO** | Live PvP transport | Turn timers, synchronized two-player state, and reconnection handling need bidirectional low-latency messaging that REST polling can't deliver cleanly |
| **jsonwebtoken** | JWT issue/verify | Part of the deliberate **custom JWT auth** decision (below) |
| **bcrypt** | Password hashing | Industry-standard adaptive hashing for the credential store |
| **nodemailer** | Email OTP delivery | Sends verification and password-reset codes via SMTP (Gmail app-password account) |
| **@supabase/supabase-js** | Database client | Direct PostgreSQL access for Supabase — **no ORM**, hand-written SQL with quoted camelCase column names (see [Database Plan](../database/database-plan.md)) |
| **cors** | Cross-origin policy | Frontend (Vercel) and backend (Render) live on different origins |
| **Vitest** + **Supertest** | Integration testing | Route-level tests against mocked Supabase fixtures |

## External services

| Service | Role | Notes |
| :--- | :--- | :--- |
| **Supabase** | Managed PostgreSQL 15 + Storage | Card images uploaded from the authoring console go to Supabase Storage; free tier |
| **Vercel** | Frontend hosting | Automatic builds from the main branch |
| **Render** | Backend hosting | Deployment guide (`deployment/RENDER_DEPLOYMENT.md`, repo root); execution still pending (fix F47) |
| **Gitea** (`sdp.ms.wits.ac.za`) | Source control + CI runners | University-hosted; 2 × `sdp-runner` act_runner v3.3.2 execute the pipelines |
| **GitHub Actions** | CI (legacy path) | Original CI runner; migrated to native Gitea Actions in Sprint 2 ([migration plan](gitea-actions-migration-plan.md)) |
| **GitHub Pages** | This documentation site | MkDocs Material build, deployed from the docs workflow |
| **Gmail SMTP** | OTP email delivery | App-password account dedicated to the project (credential hygiene tracked as fix F7) |

## Documentation tooling

| Tool | Role |
| :--- | :--- |
| **MkDocs** + **Material for MkDocs** | This site — static docs with search, navigation, and admonitions |
| **Mermaid** | Architecture and workflow diagrams rendered inline |

---

## Deliberate non-dependencies

These are as much a part of the third-party story as what we *do* use:

- **No third-party auth provider** (Firebase, Auth0, Supabase Auth) — authentication is a custom JWT + bcrypt implementation so the student-identity model (student number, Wits email domain, role enum) stays fully under the team's control. A Sprint 3 proposal to move to Supabase Auth is recorded in the handover guide, weighed against deleting the in-house email/OTP code.
- **No ORM** — all database access is hand-written SQL through the Supabase client, keeping queries explicit and reviewed.
- **No paid map tiles** — Leaflet + open tile sources instead of Google Maps.
- **No in-memory mock database** — `mockDb.ts` (a pre-Sprint-2 local fallback) was deleted once the Supabase-only approach settled; tests mock Supabase directly instead.

## Attribution notes

- The **Haversine formula** used for the 25 m geofence is standard public-domain spherical-trigonometry mathematics — implemented in-house, not copied from a library.
- **Game content** — campus landmark trivia, card definitions, and stat values — is original team-authored material. Wits campus coordinates are factual data.
- Battle rules, engine logic, and the Kudu CPU AI are original implementations, documented in the [CPU Battle Rules](cpu-battle-rules.md) rulebook.
