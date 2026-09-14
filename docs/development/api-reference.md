# API Reference

Wits Quest exposes a **hand-written REST API** (Express + TypeScript) plus a **Socket.IO WebSocket layer** for real-time PvP. Supabase provides the Postgres database, authentication, and card-image storage, but never generates an API — every route below is team-written code, satisfying the course brief's hand-written API requirement.

- **Base URL (development):** `http://localhost:3000`
- **Base URL (production):** `https://wits-quest-backend.onrender.com` (configured via `render.yaml`, health probe at `/api/health`)
- **Content type:** `application/json`
- **Authentication:** `Authorization: Bearer <token>` where the token is **issued by Supabase Auth** (the frontend obtains it via `supabase.auth.signIn/signUp`). The backend never mints, stores, or refreshes tokens — its `authMiddleware` verifies each request with `supabase.auth.getUser(token)` using the service-role key and rejects anything invalid with 401.

Endpoint status legend:

- ✅ — implemented and verified against the Sprint 2 code
- ◐ — implemented per the code audit; not yet re-verified live
- ⚠ — implemented but has a known tracked defect (fix ID in brackets, see the [Fix Register](fix-register.md))

---

## Authentication — Supabase Auth + `/api/auth`

Since the Sprint 2 auth migration, account creation and sign-in happen **client-side against Supabase Auth directly** (email + password, OTP verification email delivered by Supabase). The backend's auth surface is deliberately tiny:

| Method | Path | Auth | Purpose | Status |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/auth/complete-signup` | Bearer | Idempotent profile completion after Supabase sign-up: creates the users row, seeds Level 1 / 100 Essence / Elo 1000, grants the 5 starter cards (`card-008`…`card-012`), and builds the default deck. Role (STUDENT/ADMIN) is derived from the verified Wits email domain. | ✅ |
| GET | `/api/auth/me` | Bearer | The authenticated user's own profile — self-heals a missing users row and returns 403 if a telemetry audit has suspended the account. | ✅ |

## Users & Progression — `/api/users`

| Method | Path | Auth | Purpose | Status |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/users` | — | List students — explicit public-column set (id, username, level, Elo, division, avatar). No credential columns exist in the table since the Supabase Auth migration. | ✅ |
| GET | `/api/users/:id` | — | Public profile of one student. | ✅ |
| PUT | `/api/users/:id` | — | Update profile (avatar, username). | ◐ no ownership check yet |
| GET | `/api/users/leaderboard` | — | Real division ladder — top 100 players from the database, sortable via `?sort=elo`. | ✅ formerly hardcoded [F18] — fixed |
| GET | `/api/users/:id/cards` | — | The user's card collection with resolved stats. | ✅ |
| GET | `/api/users/:id/decks` | — | Retrieve a player's decks. | ✅ |
| GET | `/api/avatars` | — | Avatar catalogue. | ✅ |
| POST | `/api/avatars` | — | Add an avatar. | ◐ authoring route, no role guard yet [F5] |

## Cards & Deck — `/api/cards`, `/api/player`

| Method | Path | Auth | Purpose | Status |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/cards` | — | Published card catalogue only (category, rarity, ATK/DEF/SPD/BRN) — what players see. | ✅ |
| GET | `/api/cards/all` | Bearer | Full catalogue including drafts — the authoring console view. | ✅ |
| POST | `/api/cards` | Bearer | Author a new card (starts as a draft). | ⚠ no ADMIN role guard yet [F5] |
| POST | `/api/cards/upload` | Bearer | Multipart card-image upload (multer, 5 MB limit) into the Supabase Storage `card-images` bucket. | ✅ |
| POST | `/api/player/deck` | Bearer | Save a deck with full server-side validation: exactly 5 cards, no duplicates, every card owned by the player, total stat budget enforced. | ✅ |

## Events — `/api/events`

| Method | Path | Auth | Purpose | Status |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/events` | — | Active campus events (lat/lng, 25 m radius, time window) — what the map shows. | ✅ |
| GET | `/api/events/all` | Bearer | Every event including inactive — authoring console view. | ✅ |
| POST | `/api/events` | — | Create an event. | ⚠ no auth middleware or role guard [F5] |
| PUT | `/api/events/:id` | — | Update an event. | ⚠ no auth middleware or role guard [F5] |
| DELETE | `/api/events/:id` | — | Delete an event. | ⚠ no auth middleware or role guard [F5] |
| GET | `/api/events/:id/trivia` | — | List an event's trivia questions — **withholds the correct answers**. | ✅ answer-leak fixed |
| POST | `/api/events/:id/trivia` | — | Author trivia for an event. | ⚠ no role guard [F5] |
| POST | `/api/events/:id/answer` | — | *Legacy duplicate* answer endpoint that trusts `userId` from the body. | ⚠ slated for removal [F3] |

## Trivia — `/api/trivia`

| Method | Path | Auth | Purpose | Status |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/trivia` | Bearer | List trivia questions (authoring). | ⚠ no role guard [F5] |
| POST | `/api/trivia` | Bearer | Author a trivia question. | ⚠ no role guard [F5] |
| GET | `/api/events/:eventId/next-trivia` | Bearer | The next unanswered question for the current player at an event. | ✅ |
| POST | `/api/trivia/answer` | Bearer | Submit `{ triviaId, answer }`. The server grades multiple-choice and text answers, **rejects duplicate attempts (400)** and already-completed events (**409**), awards card + XP + Essence, and reveals the correct answer. | ✅ repeat farming closed [F6]; ⚠ no server-side 25 m coordinate check [F1] |
| POST | `/api/trivia/checkin` | Bearer | Replay an offline-queued attempt (with captured coordinates and timestamp) after reconnect. | ◐ |
| GET | `/api/player/completed-events` | Bearer | Events the player has already cleared — drives map markers. | ✅ |

## CPU Battle — `/api/battle`

| Method | Path | Auth | Purpose | Status |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/battle/record` | Bearer | Record a finished CPU battle and apply rewards (XP/Essence/Elo, level-ups, streak multipliers). | ⚠ persists the client-declared outcome without re-validation [F2] |
| POST | `/api/battle/result` | — | *Overlapping legacy reward endpoint* (registered in the auth router). | ⚠ unauthenticated; to be consolidated with `/record` [F15] |
| GET | `/api/battle/history` | Bearer | The player's past battles. | ✅ |
| GET | `/api/battle/live-online` | Bearer | Players currently online for the live-match lobby. | ✅ |

## Async PvP — `/api/battle/async`

All routes behind `authMiddleware`. The full lifecycle is a 6-status state machine:
`PENDING_ACCEPTANCE → CHALLENGER_TURN / DEFENDER_TURN → COMPLETED / EXPIRED / DECLINED`.

| Method | Path | Auth | Purpose | Status |
| :--- | :--- | :--- | :--- | :--- |
| GET | `/api/battle/async/opponents` | Bearer | Every other registered student (public fields only) for the challenge picker. | ✅ |
| GET | `/api/battle/async/my-matches` | Bearer | Matches bucketed into **Your Turn / Waiting / Challenges / History**; lazily expires stale challenges on read. | ✅ |
| GET | `/api/battle/async/:id` | Bearer | Full match detail for the play-turn view. Returns `yourDeck` and `usedCardIds`; only reveals **your** current card — never the opponent's in-flight card. | ✅ |
| POST | `/api/battle/async/challenge` | Bearer | `{ defenderId }` — snapshots both default decks, sets 24 h `expiresAt`, status `PENDING_ACCEPTANCE`. Rejects a duplicate active challenge in either direction (409). | ✅ |
| POST | `/api/battle/async/:id/accept` | Bearer | Defender accepts; flips to `CHALLENGER_TURN`. | ✅ |
| POST | `/api/battle/async/:id/decline` | Bearer | Defender declines; terminal status `DECLINED`. | ✅ |
| POST | `/api/battle/async/:id/play-turn` | Bearer | `{ cardId, stat }` — only the side whose turn it is may call. The server resolves both sides' cards and the round via `battleResolution.ts`; on match decision it runs `applyMatchResult` for both sides and returns a `matchEnd` reward object. | ✅ |

Design notes:

- **Turn state is derived, not stored.** Whose turn it is and each side's per-stat quota are recomputed from `roundsHistory` on every read (`asyncChallengeState.ts`), eliminating a class of stored-state drift bugs.
- **24-hour expiry is lazy-checked**, on every read — a lapsed invite expires with no forfeit; a match already underway forfeits to the side *not* holding the pick.
- The client **only ever sends a card + stat choice** — never a claimed result.

## Live PvP — Socket.IO events

Transport: Socket.IO over the same server. The server is authoritative: it fetches both real decks itself, resolves every round, and rejects invalid picks.

**Client → server**

| Event | Payload | Purpose |
| :--- | :--- | :--- |
| `join_battle` | `matchId`, `userId` | Join the shared lobby / resume a match. No deck is trusted from the client — the server fetches it. |
| `submit_turn` | `cardId`, `stat` | The current picker's move. Only the picker's submission is accepted. |
| `set_active_card` | `cardId` | Change which of your cards is "up" when you're not the picker. |

**Server → client**

| Event | Payload | Purpose |
| :--- | :--- | :--- |
| `battle_start` | real deck | Both sides' resolved decks (to each their own). |
| `turn_state` | `isYourTurn`, `pickerUsername`, `turnEndsAt`, `roundNumber` | Emitted whenever the picker changes; drives the synchronized countdown. |
| `round_outcome` | shared `stat`, `wasYourPick`, `autoPicked`, outcome, category edge | Round reveal. |
| `battle_end` | result + rewards | Final result with XP/Essence/Elo changes. |
| `player_disconnected` / `player_reconnected` | — | Connection status; a disconnect starts a 60 s grace window, after which the match is forfeited. |
| `turn_error` / `join_error` | message | Rejections (not your turn, quota-locked stat, repeated card, no saved deck). |

Server-enforced rules: alternating picker (win keeps the pick, tie holds, loss flips), **30-second turn timer** that auto-picks on expiry, no-repeat cards with hand replenishment, 2-use-per-stat quota, first-to-3 within 5 rounds.

## Anti-Cheat Telemetry — `/api/mock/telemetry`

| Method | Path | Auth | Purpose | Status |
| :--- | :--- | :--- | :--- | :--- |
| POST | `/api/mock/telemetry/ping` | — | Ingest a GPS ping; Haversine velocity check flags movement > 15 m/s as a teleportation/speeding violation. | ◐ |
| GET | `/api/mock/telemetry/pings` / `/players` | — | Review ingested telemetry for a player / all players. | ◐ |
| POST / GET | `/api/mock/telemetry/audit` | — | Record and list manual audit actions (e.g. suspensions). | ◐ |
| GET | `/api/mock/telemetry/status/:userId` | — | A player's anti-cheat standing. | ◐ |
| GET | `/api/mock/telemetry/suspended` | — | The suspended-player list (feeds the `/api/auth/me` 403 gate). | ◐ |

## Health

| Method | Path | Purpose | Status |
| :--- | :--- | :--- | :--- |
| GET | `/api/health` | Liveness probe for the Render deployment. | ✅ |

---

## Known API-level defects

The security and integrity gaps flagged ⚠ above are tracked with evidence and fixes in the [Fix Register](fix-register.md). Current state after the Sprint 2 hardening pass:

- **Fixed this sprint** — **F4** (unauthenticated inline routes shadowing the protected route files — removed; registration order now documented in `server.ts`), **F6** (repeat-answer card farming — `user_trivia_attempts`/`event_attempts` tables reject duplicates), **F18** (hardcoded leaderboard — now a real top-100 query), and the trivia answer-leak on `GET /api/events/:id/trivia`.
- **Resolved by the auth migration** — **F9** (OTP codes in process memory) no longer applies: Supabase Auth owns OTP delivery, and no credentials live in our database. **F7** (published credentials in the Render deployment guide) has been scrubbed; rotation is still advised.
- **Still open** — **F1** (no server-side 25 m location check on trivia attempts), **F2** (CPU battle outcomes are client-declared), **F3** (legacy `/api/events/:id/answer` trusts `userId` from the body — slated for removal), **F5** (no ADMIN role guard on authoring endpoints).

PvP routes (`/api/battle/async/*`, Socket.IO) already follow the target pattern — authenticated, server-resolved, client sends choices only — and are the reference implementation for the server-authority migration of the rest of the API.
