# Deployment

Where each part of Wits Quest is hosted and how it gets there.

---

## What runs where

| Part | Hosted on | Address |
| :--- | :--- | :--- |
| **App** (React) | Vercel | [wits-quest.vercel.app](https://wits-quest.vercel.app) |
| **API** (Node.js + Express + Socket.IO) | Render (free plan) | [wits-quest.onrender.com/api](https://wits-quest.onrender.com/api/health) |
| **Database, login and file storage** | Supabase (PostgreSQL) | Managed by Supabase |
| **Documentation** (this site) | GitHub Pages | [nkadimengkgothatso.github.io/-wits-quest](https://nkadimengkgothatso.github.io/-wits-quest/) |

## How a change goes live

Every push to `main` in the source repo runs `.github/workflows/ci.yml`, which:

1. **Deploys the app to Vercel** with the Vercel command-line tool.
2. **Starts a Render deploy** for the API through Render's deploy hook, pinned to that exact commit.
3. **Waits until the API is live** by calling `/api/health` until it reports the new commit (up to 20 minutes).

Tests run before the push, in the pre-push hook on the developer's machine (see [Git Workflow](git-workflow.md#automatic-checks)).

This documentation site deploys separately: every push to `main` in the docs repo builds the site with MkDocs and publishes it to GitHub Pages (`.github/workflows/deploy-docs.yml`).

## API settings (Render)

Set in `render.yaml`:

| Setting | Value |
| :--- | :--- |
| Root folder | `backend` |
| Build | `npm install && npm run build` |
| Start | `npm start` |
| Health check | `/api/health` |
| Auto-deploy | Off (GitHub Actions triggers deploys instead) |

Secrets are entered in the Render dashboard only, never in the code:

| Variable | What it's for |
| :--- | :--- |
| `SUPABASE_URL`, `SUPABASE_KEY` | Connects to the database and checks login tokens (service-role key) |
| `OPENROUTESERVICE_API_KEY` | Walking directions. Without it the map draws a straight line instead |
| `CORS_ORIGINS` | Extra app addresses allowed to call the API (optional) |
| `NODE_ENV` | `production` |

## App settings (Vercel)

| Variable | What it's for |
| :--- | :--- |
| `VITE_API_URL` | Where the API lives (`https://wits-quest.onrender.com`) |
| `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` | Lets the app sign players in with Supabase Auth (public anon key only) |

## Database changes

Changes to the database are SQL files in the source repo (`docs/database/migrations/`), named by date. They are run once in the Supabase SQL editor, in date order. See [Database Schema](../database/database-schema.md).

## Rules

- Only `main` deploys. Work-in-progress branches never go live.
- Secrets live only in the Vercel, Render and Supabase dashboards.
- Feature freeze for the final submission is **4 October**.

!!! note "Cold starts"
    Render's free plan sleeps after a period with no traffic, so the first request can take up to a minute. After that, the API responds normally.
