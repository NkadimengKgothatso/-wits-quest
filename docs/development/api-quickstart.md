# API Quick Start — Verified Working Routes

The exact commands to run the backend locally and exercise **every endpoint that was verified to respond** on the running server, from a PowerShell terminal (the team default). The full route catalogue — including routes with known defects, which will misbehave if you call them — lives in the [API Reference](api-reference.md). Routes flagged ⚠/◐ there are deliberately excluded here; see [Routes to avoid in a demo](#routes-to-avoid-in-a-demo) below.

---

## 1. Install dependencies and start the backend

```powershell
# from the repo root (skip if already done)
npm run install:all

cd backend
npm run dev
```

Runs on `http://localhost:3000` (the `PORT` in `backend/.env`), auto-restarts on file changes. **Leave this terminal open** — everything else runs in a second terminal.

## 2. (Optional) Start the frontend — only needed to obtain a login token

```powershell
cd frontend
npm run dev
```

Runs on `http://localhost:5173`. You only need it for step 4, to log in and grab a token.

## 3. Health check — no auth required

```powershell
curl.exe http://localhost:3000/api/health
```

Expected:

```json
{ "status": "ok", "service": "Wits Quest API (Supabase)", "timestamp": "..." }
```

!!! note "Use `curl.exe`, not bare `curl`"
    PowerShell aliases `curl` to `Invoke-WebRequest`, which behaves differently (no `-H`/`-d` like real curl). If the health check doesn't respond, the backend isn't actually running or is on a different port — check the terminal from step 1 for errors.

## 4. Get a token once, reuse it for every authenticated call

Protected routes need a Supabase JWT in the `Authorization` header. The backend never mints tokens — it verifies the one Supabase Auth issued at login.

1. Open the running frontend (step 2) in a browser and log in.
2. In DevTools (F12 → **Console**) run:

```js
JSON.parse(localStorage.getItem(Object.keys(localStorage).find((k) => k.includes('auth-token'))))
  .access_token;
```

3. Copy the printed string (starts with `eyJ...`) and store it in the terminal you'll run curl from:

```powershell
$env:TOKEN = '<paste-token-here>'
```

The variable lasts only for that terminal session, and the token itself expires after ~1 hour — re-run this step in any new terminal. Verify it works:

```powershell
curl.exe http://localhost:3000/api/auth/me -H "Authorization: Bearer $env:TOKEN"
```

Expected: a JSON user object with your profile (level, XP, essence, avatar, …). PowerShell-native alternative: `Invoke-RestMethod http://localhost:3000/api/auth/me -Headers @{ Authorization = "Bearer $env:TOKEN" }`.

## 5. The verified routes

| Method | Route | Auth | Verified response |
| :--- | :--- | :--- | :--- |
| GET | `/api/health` | — | Liveness probe: `{ "status": "ok", … }` |
| GET | `/api/cards` | — | Published card catalogue |
| GET | `/api/users/leaderboard` | — | Real division ladder (top 100) |
| GET | `/api/avatars` | — | Avatar catalogue |
| GET | `/api/auth/me` | Bearer | Your own profile |
| GET | `/api/battle/history` | Bearer | Your CPU/PvP battle history |
| GET | `/api/battle/async/my-matches` | Bearer | Async PvP matches bucketed Your Turn / Waiting / Challenges / History |
| POST | `/api/player/deck` | Bearer | Save your default deck (body below) |
| GET | `/api/users/:id/cards` | — | Another player's card collection |
| GET | `/api/users/:id/decks` | — | Another player's decks |

## 6. Copy-paste calls

**No auth required:**

```powershell
curl.exe http://localhost:3000/api/cards
curl.exe http://localhost:3000/api/users/leaderboard
curl.exe http://localhost:3000/api/avatars
```

**Auth required (uses `$env:TOKEN` from step 4):**

```powershell
curl.exe http://localhost:3000/api/auth/me -H "Authorization: Bearer $env:TOKEN"
curl.exe http://localhost:3000/api/battle/history -H "Authorization: Bearer $env:TOKEN"
curl.exe http://localhost:3000/api/battle/async/my-matches -H "Authorization: Bearer $env:TOKEN"
```

**Save your default deck (POST with a JSON body):**

```powershell
curl.exe -X POST http://localhost:3000/api/player/deck `
  -H "Authorization: Bearer $env:TOKEN" `
  -H "Content-Type: application/json" `
  -d '{\"deckName\":\"My Deck\",\"cardIds\":[\"card-008\",\"card-009\",\"card-010\",\"card-011\",\"card-012\"]}'
```

PowerShell line-continuation is a backtick (`` ` ``) at the end of the line, not `\`. The JSON body quotes are escaped with `\"` because PowerShell is already inside single quotes.

**Routes that take another user's id** — get your own id from the `/api/auth/me` response:

```powershell
curl.exe http://localhost:3000/api/users/<user-id>/cards
curl.exe http://localhost:3000/api/users/<user-id>/decks
```

**Bash equivalent (Git Bash / WSL / macOS / Linux)** — `export` instead of `$env:`, bare `curl` works, and `\` for line continuation:

```bash
export TOKEN='<paste-token-here>'

curl http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer $TOKEN"

curl -X POST http://localhost:3000/api/player/deck \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"deckName":"My Deck","cardIds":["card-008","card-009","card-010","card-011","card-012"]}'
```

## Routes to avoid in a demo

Some routes in the [API Reference](api-reference.md) are listed for completeness but have known defects — calling them live produces errors or misleading behaviour:

- `POST /api/battle/result` — overlapping legacy reward endpoint, unauthenticated; being consolidated with `/record` ([F15](fix-register.md)).
- `POST /api/events/:id/answer` — legacy duplicate that trusts `userId` from the request body; slated for removal ([F3](fix-register.md)).
- `PUT /api/users/:id` — works, but has no ownership check yet.
- Authoring routes (`POST /api/cards`, `POST/PUT/DELETE /api/events`, …) — no ADMIN role guard yet ([F5](fix-register.md)).

## Testing without a live server

To check backend logic without hitting a real server:

```powershell
cd backend
npm test                                   # full suite
npx vitest run src/routes/deck.test.ts     # one file
```

For how the backend is laid out route-by-route, see [Development Architecture](architecture.md).
