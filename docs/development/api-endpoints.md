# API Endpoint Catalogue

Every REST endpoint of the live Wits Quest API, with its full working address. The list was checked against the code on `main` that Render deploys (`backend/src/routes/` and `server.ts`, last changed 1 October 2026).

!!! tip "Try them in the browser"
    The **Swagger UI** is live at [wits-quest.onrender.com/api/docs](https://wits-quest.onrender.com/api/docs), and you can also use it inside these docs on the [Swagger UI](swagger.md) page. The **On Swagger** column shows which endpoints are on it. **Try it out** sends a real request and shows the response. The raw OpenAPI 3.0 file is at [wits-quest.onrender.com/api/openapi.json](https://wits-quest.onrender.com/api/openapi.json).

Public `GET` endpoints are links, so you can open them straight from this page. Replace `{id}`-style parts with a real id. Every endpoint also works with `/api/v1` in place of `/api`.

**Calling the API**

- Base URL: `https://wits-quest.onrender.com/api` (also `https://wits-quest.onrender.com/api/v1`). Locally it is `http://localhost:3000/api`.
- 🌐 **Public** endpoints need no token. 🔒 **Login** endpoints need a bearer token:
  `POST /auth/token` with an email + password, copy `access_token`, paste it into
  Swagger UI's **Authorize** button (JWT, ~1 hour validity). 🛡️ **Admin** endpoints
  additionally need an ADMIN account.
- The API runs on Render's free plan, so the first request after a quiet spell can take up to a minute while the server wakes up.
- Live PvP and the ranked queue run over **socket.io**, not REST — see the
  [Live PvP walkthrough](live-pvp-walkthrough.md).

## Health & login

| Method | Endpoint | Auth | Summary | On Swagger |
| --- | --- | --- | --- | :---: |
| `GET` | [`https://wits-quest.onrender.com/api/health`](https://wits-quest.onrender.com/api/health) | Public | Server status and deployed commit | ✅ |
| `GET` | [`https://wits-quest.onrender.com/api/docs`](https://wits-quest.onrender.com/api/docs) | Public | Swagger page for trying the API | — |
| `GET` | [`https://wits-quest.onrender.com/api/openapi.json`](https://wits-quest.onrender.com/api/openapi.json) | Public | The OpenAPI 3.0 description of the API | — |
| `POST` | `https://wits-quest.onrender.com/api/auth/token` | Public | Log in and get an access token (paste it into Authorize 🔒) | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/auth/me` | Login | Your profile (Elo, XP, Essence, streak…) | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/auth/complete-signup` | Login | Create your game profile after sign-up (no body) | ✅ |
| `DELETE` | `https://wits-quest.onrender.com/api/auth/me` | Login | Delete your own account and its game data | Not yet |

## Players

| Method | Endpoint | Auth | Summary | On Swagger |
| --- | --- | --- | --- | :---: |
| `GET` | [`https://wits-quest.onrender.com/api/users`](https://wits-quest.onrender.com/api/users) | Public | All players | ✅ |
| `GET` | [`https://wits-quest.onrender.com/api/users/leaderboard`](https://wits-quest.onrender.com/api/users/leaderboard) | Public | Leaderboard | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/users/{id}` | Public | One player | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/users/{id}/cards` | Public | A player's card collection | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/users/{id}/decks` | Public | A player's decks | ✅ |
| `PUT` | `https://wits-quest.onrender.com/api/users/{id}` | Login | Update your own profile (username, avatar, isOnline) | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/player/deck` | Login | Save your deck (5 owned cards, within budget) | ✅ |
| `GET` | [`https://wits-quest.onrender.com/api/avatars`](https://wits-quest.onrender.com/api/avatars) | Public | Avatar catalogue | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/avatars` | Admin | Add an avatar | Not yet |

## Events & trivia

| Method | Endpoint | Auth | Summary | On Swagger |
| --- | --- | --- | --- | :---: |
| `GET` | [`https://wits-quest.onrender.com/api/events`](https://wits-quest.onrender.com/api/events) | Public | Published campus events | ✅ |
| `GET` | [`https://wits-quest.onrender.com/api/cards`](https://wits-quest.onrender.com/api/cards) | Public | Published card catalogue | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/events/{eventId}/next-trivia` | Login | Next unanswered question at an event | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/events/{id}/trivia` | Login | An event's question (answer not included) | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/events/{id}/answer` | Login | Answer a single-question event (location-checked) | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/checkin/qr` | Login | Prove you are at an event by scanning its QR code (when GPS is weak) | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/trivia/answer` | Login | Answer a multi-question event step (location-checked) | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/player/completed-events` | Login | Events you have completed | ✅ |

## Battles

| Method | Endpoint | Auth | Summary | On Swagger |
| --- | --- | --- | --- | :---: |
| `POST` | `https://wits-quest.onrender.com/api/battle/cpu/start` | Login | Start a CPU match (server plays it) | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/battle/cpu/{matchId}/round` | Login | Play a round | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/battle/cpu/{matchId}/settle` | Login | Claim a finished match whose payout failed | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/battle/history` | Login | Your match history | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/battle/live-online` | Login | Players available for Live PvP | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/battle/live-matches` | Login | Live matches you can watch | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/battle/async/opponents` | Login | Players you can challenge (async) | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/battle/async/my-matches` | Login | Your async matches | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/battle/async/{id}` | Login | One async match | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/battle/async/challenge` | Login | Challenge a player | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/battle/async/{id}/accept` | Login | Accept a challenge | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/battle/async/{id}/decline` | Login | Decline a challenge | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/battle/async/{id}/play-turn` | Login | Pick or respond in an async round | ✅ |

## Ranked

| Method | Endpoint | Auth | Summary | On Swagger |
| --- | --- | --- | --- | :---: |
| `GET` | `https://wits-quest.onrender.com/api/ranked/seasons` | Login | All seasons (ranked matches themselves run over socket.io) | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/ranked/season/current` | Login | The active season | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/ranked/season/archive` | Admin | Archive the season (snapshot + soft Elo reset) and start a new one | ✅ |

## Forge & trading

| Method | Endpoint | Auth | Summary | On Swagger |
| --- | --- | --- | --- | :---: |
| `POST` | `https://wits-quest.onrender.com/api/forge/scrap` | Login | Scrap one duplicate for Essence | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/forge/upgrade` | Login | Upgrade a card (100 Essence + 2 copies) | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/trades` | Login | Your trade offers | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/trades` | Login | Offer a trade | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/trades/{tradeId}/accept` | Login | Accept a trade offered to you | ✅ |

## Trails & territory

| Method | Endpoint | Auth | Summary | On Swagger |
| --- | --- | --- | --- | :---: |
| `GET` | `https://wits-quest.onrender.com/api/trails` | Login | Published quest trails with your progress | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/trails/progress` | Login | Your progress on every trail | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/trails/{id}` | Login | One trail with its steps | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/trails/{id}/progress` | Login | Complete the current step (its event must be completed) | ✅ |
| `GET` | [`https://wits-quest.onrender.com/api/territories`](https://wits-quest.onrender.com/api/territories) | Public | Campus zones and their owners | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/territories/{id}` | Public | One zone with its events | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/territories/{id}/claim` | Admin | Set a zone's owner by hand (admin override) | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/routing/route` | Login | Walking route between two points (OpenRouteService) | ✅ |

## Anti-cheat & telemetry

| Method | Endpoint | Auth | Summary | On Swagger |
| --- | --- | --- | --- | :---: |
| `POST` | `https://wits-quest.onrender.com/api/telemetry/ping` | Login | Send a GPS reading (checked for impossible movement) | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/telemetry/players` | Login | Online players on the map | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/telemetry/achievements/check/{userId}` | Login | Re-check and award achievements (self or admin) | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/telemetry/pings` | Admin | Recent GPS pings | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/telemetry/flags` | Admin | Anti-cheat flags | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/telemetry/audit` | Admin | Moderation audit log | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/telemetry/suspended` | Admin | Suspended players | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/telemetry/trust-scores` | Admin | Trust score for every player | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/telemetry/trust-score/{userId}` | Admin | Trust score for one player | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/telemetry/trust-history/{userId}` | Admin | One player's trust-level changes | Not yet |
| `POST` | `https://wits-quest.onrender.com/api/telemetry/audit` | Admin | Record a moderation action (warn, suspend, clear) | Not yet |
| `GET` | `https://wits-quest.onrender.com/api/telemetry/status/{userId}` | Public | Whether an account is suspended | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/telemetry/achievements/{userId}` | Login | A player's achievements (yourself, or anyone if admin) | ✅ |

## Admin: content

| Method | Endpoint | Auth | Summary | On Swagger |
| --- | --- | --- | --- | :---: |
| `GET` | `https://wits-quest.onrender.com/api/events/all` | Admin | Every event, any status | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/cards/all` | Admin | Every card, any status | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/trivia` | Admin | Trivia questions | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/events` | Admin | Create an event (starts as draft) | ✅ |
| `PUT` | `https://wits-quest.onrender.com/api/events/{id}` | Admin | Edit an event | Not yet |
| `DELETE` | `https://wits-quest.onrender.com/api/events/{id}` | Admin | Delete an event | Not yet |
| `POST` | `https://wits-quest.onrender.com/api/events/{id}/trivia` | Admin | Create or replace an event's question | Not yet |
| `POST` | `https://wits-quest.onrender.com/api/events/{eventId}/generate-qr` | Admin | Create the QR code for an event | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/trivia` | Admin | Create a trivia question | Not yet |
| `GET` | `https://wits-quest.onrender.com/api/trivia/performance` | Admin | Questions with low pass rates that need repair | Not yet |
| `POST` | `https://wits-quest.onrender.com/api/cards` | Admin | Create a card (starts as draft) | Not yet |
| `POST` | `https://wits-quest.onrender.com/api/cards/upload` | Admin | Upload a card image (max 5 MB) | Not yet |
| `PATCH` | `https://wits-quest.onrender.com/api/events/{id}/status` | Admin | Move an event: draft → review → published → retired | ✅ |
| `PATCH` | `https://wits-quest.onrender.com/api/cards/{id}/status` | Admin | Move a card through the lifecycle | ✅ |
| `PATCH` | `https://wits-quest.onrender.com/api/trivia/{id}/status` | Admin | Move a question through the lifecycle | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/events/auto-place` | Admin | Rotate auto-placed events across campus now | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/campaigns` | Admin | Scheduling campaigns (terms / open days) | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/campaigns` | Admin | Create a campaign | Not yet |
| `PUT` | `https://wits-quest.onrender.com/api/campaigns/{id}` | Admin | Edit a campaign | Not yet |
| `DELETE` | `https://wits-quest.onrender.com/api/campaigns/{id}` | Admin | Delete a campaign | Not yet |

## Admin: progression

| Method | Endpoint | Auth | Summary | On Swagger |
| --- | --- | --- | --- | :---: |
| `GET` | `https://wits-quest.onrender.com/api/achievements/all` | Admin | Every achievement rule | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/achievements` | Admin | Create an achievement rule | ✅ |
| `PATCH` | `https://wits-quest.onrender.com/api/achievements/{id}/deactivate` | Admin | Deactivate a rule | ✅ |
| `PATCH` | `https://wits-quest.onrender.com/api/achievements/{id}` | Admin | Edit a rule (name, icon, target; not its type) | Not yet |
| `GET` | `https://wits-quest.onrender.com/api/trails/all` | Admin | Every quest trail, any status, with steps | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/trails` | Admin | Create a trail (draft) | ✅ |
| `POST` | `https://wits-quest.onrender.com/api/trails/{id}/steps` | Admin | Add an event as the next step | ✅ |
| `PATCH` | `https://wits-quest.onrender.com/api/trails/{id}/status` | Admin | Publish or retire a trail | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/telemetry/analytics/active-players` | Admin | Daily active players | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/telemetry/analytics/question-pass-rates` | Admin | Pass rate per question | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/telemetry/analytics/rarity-drop-rates` | Admin | Card drops per rarity vs target | ✅ |
| `GET` | `https://wits-quest.onrender.com/api/telemetry/analytics/card-rates` | Admin | How many copies of each card players own | Not yet |
| `GET` | `https://wits-quest.onrender.com/api/telemetry/analytics/trivia-rates` | Admin | Correct vs wrong answers per question | Not yet |
| `GET` | `https://wits-quest.onrender.com/api/telemetry/analytics/event-popularity` | Admin | Which locations players visit most and least | Not yet |
| `GET` | `https://wits-quest.onrender.com/api/telemetry/analytics/checkin-sources` | Admin | Share of check-ins made by GPS vs QR code | ✅ |

*Total: 101 endpoints. One old endpoint, `POST /trivia/checkin`, still exists but only returns `410 Gone`, so it is not listed.*

*18 endpoints work but are not on the Swagger page yet, marked "Not yet" above. They can still be called with curl or Postman. Adding them is one line each in `backend/src/docs/openapi.ts`.*
