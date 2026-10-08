# API Quick Start

Wits Quest has a **hand-written REST API** (Express + TypeScript) and a **Socket.IO** connection for live battles. Supabase stores the data and handles login, but it does not generate any of our endpoints. Every route is code the team wrote.

The full list of endpoints is in the [Endpoint Catalogue](api-endpoints.md).

---

## Base URLs

The base URL is the start of every endpoint's address. It isn't an endpoint by itself, so opening `https://wits-quest.onrender.com/api` on its own returns `No such endpoint: GET /api`. Add an endpoint's path to the end, for example `/health`.

| Where | Base URL | Working example |
| :--- | :--- | :--- |
| Live API | `https://wits-quest.onrender.com/api` | [https://wits-quest.onrender.com/api/health](https://wits-quest.onrender.com/api/health) |
| Versioned live API (use this for new clients) | `https://wits-quest.onrender.com/api/v1` | [https://wits-quest.onrender.com/api/v1/health](https://wits-quest.onrender.com/api/v1/health) |
| Swagger UI (try every endpoint in the browser) | | [https://wits-quest.onrender.com/api/docs](https://wits-quest.onrender.com/api/docs), or the [Swagger UI](swagger.md) page in these docs |
| Local development | `http://localhost:3000/api` | `http://localhost:3000/api/health` |

Every route works under both `/api` and `/api/v1`. The app uses `/api`. External users should use `/api/v1`. The full list of paths is in the [Endpoint Catalogue](api-endpoints.md).

!!! note "First request can be slow"
    The backend runs on Render's free plan, which sleeps when idle. The first request after a quiet period can take up to a minute while it wakes up.

## 1. Check the API is up

```bash
curl https://wits-quest.onrender.com/api/health
```

```json
{ "status": "ok", "service": "Wits Quest API (Supabase)", "timestamp": "...", "commit": "..." }
```

## 2. Get a login token

Most endpoints need a token in the header: `Authorization: Bearer <token>`.

The backend never creates passwords or tokens itself. Supabase Auth issues the token, and the backend checks it on every request.

```bash
curl -X POST https://wits-quest.onrender.com/api/auth/token \
  -H "Content-Type: application/json" \
  -d '{"email":"<your email>","password":"<your password>"}'
```

Copy `access_token` from the response. It lasts about one hour. On the Swagger page, paste it into the **Authorize** button instead.

## 3. Make calls

```bash
export TOKEN='<paste token here>'

# No login needed
curl https://wits-quest.onrender.com/api/cards
curl https://wits-quest.onrender.com/api/users/leaderboard

# Login needed
curl https://wits-quest.onrender.com/api/auth/me -H "Authorization: Bearer $TOKEN"
curl https://wits-quest.onrender.com/api/battle/history -H "Authorization: Bearer $TOKEN"

# Save a deck (5 cards you own)
curl -X POST https://wits-quest.onrender.com/api/player/deck \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deckName":"My Deck","cardIds":["card-008","card-009","card-010","card-011","card-012"]}'
```

!!! tip "Using PowerShell?"
    Type `curl.exe` instead of `curl`, store the token with `$env:TOKEN = '...'`, and end continued lines with a backtick (`` ` ``) instead of `\`.

## Access levels

| Level | Who can call it |
| :--- | :--- |
| **Public** | Anyone, no token |
| **Login** | Any signed-in player |
| **Admin** | Signed-in accounts with the ADMIN role (the authoring console) |

Admin endpoints return `403` for normal players. Calls without a valid token return `401`.

## Responses and errors

- Requests and responses are JSON.
- Success uses `200` (read or update) or `201` (created).
- Errors return a JSON body like `{ "error": "Event not found" }` with a matching status: `400` bad input, `401` not logged in, `403` not allowed, `404` not found, `409` conflict (for example, answering an event twice), `410` removed endpoint, `500` server error.

## Live battles (Socket.IO)

Live PvP and the ranked queue use Socket.IO on the same server, not REST. The main events are `lobby:challenge`, `lobby:challenge_response`, `set_active_card`, `respond_turn`, `ranked:queue` and `leave_battle`. See the [Live PvP Walkthrough](live-pvp-walkthrough.md) for the full flow.

## External API: walking directions

`GET /routing/route` returns a walking route to the next event. The backend calls the **OpenRouteService** Directions API (`foot-walking`), so the API key stays on the server. If OpenRouteService fails, the app draws a straight line instead. The app also caches routes so it doesn't repeat the same request.

## Run the API locally

```bash
cd backend
npm install
npm run dev        # http://localhost:3000
npm test           # run the backend tests
```

The backend needs `SUPABASE_URL` and `SUPABASE_KEY` in `backend/.env`. `OPENROUTESERVICE_API_KEY` is optional (without it, routes fall back to a straight line).
