# Deployment

Where every part of Wits Quest is hosted, how it gets there, and how to reproduce it.

---

## Deployment map

Wits Quest ships as **three independently deployed repositories** (Decision D-03), so a documentation change never triggers the code pipeline and vice versa:

| Component | Repository | Platform | Status |
| :--- | :--- | :--- | :--- |
| **Frontend** (React app) | `big-o/Wits-Quest-frontend` | **Vercel** — automatic production builds from `main` | ✅ Live at [wits-quest.vercel.app](https://wits-quest.vercel.app/) |
| **Backend** (Node/Express API) | `big-o/Wits-Quest-Backend` | **Render** — Node web service configured via `render.yaml` | ⚠ Configured; live verification pending (F47) |
| **Documentation** (this site) | `big-o/Wits-Quest-Documentation` | **GitHub Pages** — MkDocs built by GitHub Actions | ✅ Live at [nkadimengkgothatso.github.io/-wits-quest](https://nkadimengkgothatso.github.io/-wits-quest/) |

The CI/CD pipeline that typechecks, lints, tests, and deploys on every push is documented in the [Gitea Actions Migration Plan](gitea-actions-migration-plan.md) and [Testing](testing.md); the hosting rationale is in [Third-Party Code & Services](third-party.md).

## Frontend — Vercel

- Connected to the frontend repository; **every push to `main` triggers a production build automatically**.
- Configuration flows through the Vercel dashboard — secrets are never committed; local development uses `.env.example` templates.
- `VITE_API_URL` tells the frontend where the backend lives; it is set once the Render service is live.

## Backend — Render

The backend deploys to [Render](https://render.com) as a Node.js web service:

| Setting | Value |
| :--- | :--- |
| Service name | `wits-quest-backend` |
| Runtime | Node |
| Root directory | `backend` |
| Branch | `main` |
| Build command | `npm install && npm run build` |
| Start command | `npm start` |
| Health check path | `/api/health` |

Required environment variables (set in the **Render dashboard only** — never in the repo):

| Key | Description |
| :--- | :--- |
| `NODE_ENV` | `production` |
| `PORT` | Render assigns this automatically; the backend honours it |
| `JWT_SECRET` | Strong random string for signing tokens |
| `SMTP_HOST` / `SMTP_PORT` | Gmail SMTP relay (`smtp.gmail.com`, `465`) for verification emails |
| `SMTP_USER` / `SMTP_PASS` | Google account + Google **App Password** |
| `SUPABASE_URL` / `SUPABASE_KEY` | Supabase project credentials |

After deploying, verify the health endpoint:

```bash
curl https://wits-quest-backend.onrender.com/api/health
# → { "status": "ok", "service": "Wits Quest API (Supabase)", "timestamp": "..." }
```

Then set `VITE_API_URL=https://wits-quest-backend.onrender.com` on Vercel so the live frontend talks to the live API (this also fixes the hardcoded localhost socket client — F11).

!!! warning "Credential hygiene (learned the hard way)"
    Real credentials were once committed inside a deployment document — Fix **F7**. They have been stripped; all secrets now live exclusively in platform dashboards, and every copy of this guide carries placeholders only.

## Documentation — GitHub Pages

This site is built with MkDocs (Material) and deployed by GitHub Actions (`.github/workflows/deploy-docs.yml`): every push to `main` builds the site and publishes it with `actions/deploy-pages`. The source of truth is the Gitea documentation repo; GitHub is the deployment mirror.

## Deployment rules

- Production deploys trigger from **`main` only** — never from a personal WIP branch (F45).
- Every deployed change has passed CI: `tsc --noEmit`, ESLint, the Vitest suite, and the 80% coverage gates ([Definition of Done](../project/methodology.md#definition-of-done)).
- Feature freeze for final submission is **04 Oct** ([Methodology](../project/methodology.md)).
