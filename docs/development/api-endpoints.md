# API Endpoint Catalogue

Every REST endpoint of the Wits Quest backend, checked against the route files in the backend code (`backend/src/routes/` and `server.ts`) on 1 October 2026.

You can try the endpoints in the browser on the **Swagger page** at [`/api/docs`](https://wits-quest.onrender.com/api/docs). The raw OpenAPI 3.0 file is at `/api/openapi.json`.

**Calling the API**

- Base path: `/api` (also served under `/api/v1`).
- 🌐 **Public** endpoints need no token. 🔒 **Login** endpoints need a bearer token:
  `POST /auth/token` with an email + password, copy `access_token`, paste it into
  Swagger UI's **Authorize** button (JWT, ~1 hour validity). 🛡️ **Admin** endpoints
  additionally need an ADMIN account.
- Live PvP and the ranked queue run over **socket.io**, not REST — see the
  [Live PvP walkthrough](live-pvp-walkthrough.md).

## Health & login

| Method | Path | Auth | Summary |
| --- | --- | --- | --- |
| `GET` | `/health` | Public | Server status and deployed commit |
| `GET` | `/docs` | Public | Swagger page for trying the API |
| `GET` | `/openapi.json` | Public | The OpenAPI 3.0 description of the API |
| `POST` | `/auth/token` | Public | Log in and get an access token (paste it into Authorize 🔒) |
| `GET` | `/auth/me` | Login | Your profile (Elo, XP, Essence, streak…) |
| `POST` | `/auth/complete-signup` | Login | Create your game profile after sign-up (no body) |
| `DELETE` | `/auth/me` | Login | Delete your own account and its game data |

## Players

| Method | Path | Auth | Summary |
| --- | --- | --- | --- |
| `GET` | `/users` | Public | All players |
| `GET` | `/users/leaderboard` | Public | Leaderboard |
| `GET` | `/users/{id}` | Public | One player |
| `GET` | `/users/{id}/cards` | Public | A player's card collection |
| `GET` | `/users/{id}/decks` | Public | A player's decks |
| `PUT` | `/users/{id}` | Login | Update your own profile (username, avatar, isOnline) |
| `POST` | `/player/deck` | Login | Save your deck (5 owned cards, within budget) |
| `GET` | `/avatars` | Public | Avatar catalogue |
| `POST` | `/avatars` | Admin | Add an avatar |

## Events & trivia

| Method | Path | Auth | Summary |
| --- | --- | --- | --- |
| `GET` | `/events` | Public | Published campus events |
| `GET` | `/cards` | Public | Published card catalogue |
| `GET` | `/events/{eventId}/next-trivia` | Login | Next unanswered question at an event |
| `GET` | `/events/{id}/trivia` | Login | An event's question (answer not included) |
| `POST` | `/events/{id}/answer` | Login | Answer a single-question event (location-checked) |
| `POST` | `/checkin/qr` | Login | Prove you are at an event by scanning its QR code (when GPS is weak) |
| `POST` | `/trivia/answer` | Login | Answer a multi-question event step (location-checked) |
| `GET` | `/player/completed-events` | Login | Events you have completed |

## Battles

| Method | Path | Auth | Summary |
| --- | --- | --- | --- |
| `POST` | `/battle/cpu/start` | Login | Start a CPU match (server plays it) |
| `POST` | `/battle/cpu/{matchId}/round` | Login | Play a round |
| `POST` | `/battle/cpu/{matchId}/settle` | Login | Claim a finished match whose payout failed |
| `GET` | `/battle/history` | Login | Your match history |
| `GET` | `/battle/live-online` | Login | Players available for Live PvP |
| `GET` | `/battle/live-matches` | Login | Live matches you can watch |
| `GET` | `/battle/async/opponents` | Login | Players you can challenge (async) |
| `GET` | `/battle/async/my-matches` | Login | Your async matches |
| `GET` | `/battle/async/{id}` | Login | One async match |
| `POST` | `/battle/async/challenge` | Login | Challenge a player |
| `POST` | `/battle/async/{id}/accept` | Login | Accept a challenge |
| `POST` | `/battle/async/{id}/decline` | Login | Decline a challenge |
| `POST` | `/battle/async/{id}/play-turn` | Login | Pick or respond in an async round |

## Ranked

| Method | Path | Auth | Summary |
| --- | --- | --- | --- |
| `GET` | `/ranked/seasons` | Login | All seasons (ranked matches themselves run over socket.io) |
| `GET` | `/ranked/season/current` | Login | The active season |
| `POST` | `/ranked/season/archive` | Admin | Archive the season (snapshot + soft Elo reset) and start a new one |

## Forge & trading

| Method | Path | Auth | Summary |
| --- | --- | --- | --- |
| `POST` | `/forge/scrap` | Login | Scrap one duplicate for Essence |
| `POST` | `/forge/upgrade` | Login | Upgrade a card (100 Essence + 2 copies) |
| `GET` | `/trades` | Login | Your trade offers |
| `POST` | `/trades` | Login | Offer a trade |
| `POST` | `/trades/{tradeId}/accept` | Login | Accept a trade offered to you |

## Trails & territory

| Method | Path | Auth | Summary |
| --- | --- | --- | --- |
| `GET` | `/trails` | Login | Published quest trails with your progress |
| `GET` | `/trails/progress` | Login | Your progress on every trail |
| `GET` | `/trails/{id}` | Login | One trail with its steps |
| `POST` | `/trails/{id}/progress` | Login | Complete the current step (its event must be completed) |
| `GET` | `/territories` | Public | Campus zones and their owners |
| `GET` | `/territories/{id}` | Public | One zone with its events |
| `POST` | `/territories/{id}/claim` | Admin | Set a zone's owner by hand (admin override) |
| `GET` | `/routing/route` | Login | Walking route between two points (OpenRouteService) |

## Anti-cheat & telemetry

| Method | Path | Auth | Summary |
| --- | --- | --- | --- |
| `POST` | `/telemetry/ping` | Login | Send a GPS reading (checked for impossible movement) |
| `GET` | `/telemetry/players` | Login | Online players on the map |
| `POST` | `/telemetry/achievements/check/{userId}` | Login | Re-check and award achievements (self or admin) |
| `GET` | `/telemetry/pings` | Admin | Recent GPS pings |
| `GET` | `/telemetry/flags` | Admin | Anti-cheat flags |
| `GET` | `/telemetry/audit` | Admin | Moderation audit log |
| `GET` | `/telemetry/suspended` | Admin | Suspended players |
| `GET` | `/telemetry/trust-scores` | Admin | Trust score for every player |
| `GET` | `/telemetry/trust-score/{userId}` | Admin | Trust score for one player |
| `GET` | `/telemetry/trust-history/{userId}` | Admin | One player's trust-level changes |
| `POST` | `/telemetry/audit` | Admin | Record a moderation action (warn, suspend, clear) |
| `GET` | `/telemetry/status/{userId}` | Public | Whether an account is suspended |
| `GET` | `/telemetry/achievements/{userId}` | Login | A player's achievements (yourself, or anyone if admin) |

## Admin: content

| Method | Path | Auth | Summary |
| --- | --- | --- | --- |
| `GET` | `/events/all` | Admin | Every event, any status |
| `GET` | `/cards/all` | Admin | Every card, any status |
| `GET` | `/trivia` | Admin | Trivia questions |
| `POST` | `/events` | Admin | Create an event (starts as draft) |
| `PUT` | `/events/{id}` | Admin | Edit an event |
| `DELETE` | `/events/{id}` | Admin | Delete an event |
| `POST` | `/events/{id}/trivia` | Admin | Create or replace an event's question |
| `POST` | `/events/{eventId}/generate-qr` | Admin | Create the QR code for an event |
| `POST` | `/trivia` | Admin | Create a trivia question |
| `GET` | `/trivia/performance` | Admin | Questions with low pass rates that need repair |
| `POST` | `/cards` | Admin | Create a card (starts as draft) |
| `POST` | `/cards/upload` | Admin | Upload a card image (max 5 MB) |
| `PATCH` | `/events/{id}/status` | Admin | Move an event: draft → review → published → retired |
| `PATCH` | `/cards/{id}/status` | Admin | Move a card through the lifecycle |
| `PATCH` | `/trivia/{id}/status` | Admin | Move a question through the lifecycle |
| `POST` | `/events/auto-place` | Admin | Rotate auto-placed events across campus now |
| `GET` | `/campaigns` | Admin | Scheduling campaigns (terms / open days) |
| `POST` | `/campaigns` | Admin | Create a campaign |
| `PUT` | `/campaigns/{id}` | Admin | Edit a campaign |
| `DELETE` | `/campaigns/{id}` | Admin | Delete a campaign |

## Admin: progression

| Method | Path | Auth | Summary |
| --- | --- | --- | --- |
| `GET` | `/achievements/all` | Admin | Every achievement rule |
| `POST` | `/achievements` | Admin | Create an achievement rule |
| `PATCH` | `/achievements/{id}/deactivate` | Admin | Deactivate a rule |
| `PATCH` | `/achievements/{id}` | Admin | Edit a rule (name, icon, target; not its type) |
| `GET` | `/trails/all` | Admin | Every quest trail, any status, with steps |
| `POST` | `/trails` | Admin | Create a trail (draft) |
| `POST` | `/trails/{id}/steps` | Admin | Add an event as the next step |
| `PATCH` | `/trails/{id}/status` | Admin | Publish or retire a trail |
| `GET` | `/telemetry/analytics/active-players` | Admin | Daily active players |
| `GET` | `/telemetry/analytics/question-pass-rates` | Admin | Pass rate per question |
| `GET` | `/telemetry/analytics/rarity-drop-rates` | Admin | Card drops per rarity vs target |
| `GET` | `/telemetry/analytics/card-rates` | Admin | How many copies of each card players own |
| `GET` | `/telemetry/analytics/trivia-rates` | Admin | Correct vs wrong answers per question |
| `GET` | `/telemetry/analytics/event-popularity` | Admin | Which locations players visit most and least |
| `GET` | `/telemetry/analytics/checkin-sources` | Admin | Share of check-ins made by GPS vs QR code |

*Total: 101 endpoints. One old endpoint, `POST /trivia/checkin`, still exists but only returns `410 Gone`, so it is not listed.*
