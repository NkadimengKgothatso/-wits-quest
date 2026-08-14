# Git Workflow

*This page is a starting scaffold — replace with what the team actually agrees on and update it if the workflow changes.*

## Suggested branching model

Given the team is split into 6 domain owners working largely independent modules (see [Architecture](architecture.md)), a lightweight feature-branch workflow fits well:

- `main` — always deployable/demo-ready.
- `feature/<member>-<short-description>` — one branch per feature, e.g. `feature/member1-map-explorer`.
- Merge via pull request into `main`; avoid direct pushes to `main` once the app is past early scaffolding.

## Suggested commit convention

Conventional Commits keeps history scannable across 6 contributors:

```
feat(map): add Haversine distance check for landmark radius
fix(auth): correct JWT expiry handling on refresh
docs(database): add async_pvp_challenges table spec
chore(deps): bump backend dependencies
```

## Suggested PR checklist

- [ ] Feature matches the requirement tier it targets (Basic/Intermediate/Advanced — see [Requirements](../project/requirements.md))
- [ ] No client-trusted state for anything server-authoritative (location, answers, match outcomes)
- [ ] Relevant docs page updated (this site, `docs/`)
- [ ] Tested against both `npm run dev:frontend` and `npm run dev:backend`

## `.gitignore`

The root `.gitignore` should at minimum exclude `node_modules/`, build output, and environment files across both `frontend/` and `backend/` workspaces — confirm this matches what's currently committed.

---

*Fill in: actual branch protection rules, code review requirements, CI checks (if any), and release/demo tagging convention once agreed with the team.*
