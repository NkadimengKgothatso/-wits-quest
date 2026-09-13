# Repository Separation Plan: Frontend / Backend / Documentation Mirrors on Gitea

**Related tasks:** [`SPRINT2_FEATURE_SELECTION_AND_TASK_GUIDE.md`](../SPRINT2_FEATURE_SELECTION_AND_TASK_GUIDE.md) Task 7.4 (originally scoped frontend+backend only — this plan adds a third docs repo per your request)
**Related plan:** [`gitea-actions-migration-plan.md`](gitea-actions-migration-plan.md) — CI now runs natively on Gitea; each mirror repo needs its own copy of that pattern
**Status:** Draft — for review before implementation
**Confirmed direction:** `Wits-Quest` stays the **sole source of truth** — undisturbed, all real development, deploys, and CI continue exactly as today. The three new repos exist to satisfy a **presentation/deliverable requirement** (visibly separate frontend/backend/docs repos) — they are **continuously-synced, read-only mirrors**, each carrying just enough of its own config to run its own Gitea Actions and look legitimate on inspection. Nobody opens PRs against the mirrors, nobody deploys from them; they're regenerated automatically from `Wits-Quest`.

## 1. Objective

Give `frontend`, `backend`, and documentation their own Gitea repos — each independently cloneable, each showing its own green Actions status — purely so the project presents as properly separated, without changing where actual development happens or touching `Wits-Quest` in any destructive way.

## 2. Current State (inventory)

| Path                                                   | Used by                                                                                                                    | Notes                                                                                                                                                                                                         |
| ------------------------------------------------------ | -------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `frontend/`                                            | —                                                                                                                          | Own `package.json`; the stray `wits-quest-root` file-dependency was already removed in the CI fix, so it mirrors cleanly as a standalone install target.                                                      |
| `backend/`                                             | —                                                                                                                          | Same — already dependency-clean.                                                                                                                                                                              |
| `docs/` + `mkdocs.yml` + `requirements.txt`            | MkDocs site                                                                                                                | `mkdocs.yml` and `requirements.txt` live at the **repo root**, not inside `docs/` — a plain subtree of `docs/` won't carry them; the sync needs to add them explicitly (§5).                                  |
| `data/*.json`                                          | `backend/src/db/seed.ts` only (`resolve(__dirname,'..','..','..','data','mock_cards.json')`, 3 levels up to monorepo root) | If the backend mirror is meant to run its own tests/seed, this path assumption needs to travel with it (see Risks).                                                                                           |
| `deployment/docker-compose.yml`                        | —                                                                                                                          | References Postgres/Redis and a `deployment/Dockerfile` that doesn't exist; backend actually runs `better-sqlite3`. Looks stale — **not** part of this plan, left untouched.                                  |
| root `eslint.config.js`, `.prettierrc.json`, `.husky/` | frontend + backend                                                                                                         | Only needed in a mirror if that mirror's own CI re-lints/re-formats independently (see §4 decision).                                                                                                          |
| `.gitea/workflows/ci.yml`                              | frontend + backend + docs                                                                                                  | Each mirror needs its **own** slice of this, injected during sync (mirrors don't get PRs, so there's no "author a workflow file directly in the mirror" step — it has to arrive via the sync itself, see §5). |

## 3. Target State

- **`Wits-Quest`** — unchanged. All development, all PRs, all CI-as-configured-today continues exactly as it does now. This repo becomes the single place that _defines_ what the mirrors look like.
- **`Wits-Quest-frontend`**, **`Wits-Quest-Backend`**, **`Wits-Quest-Documentation`** — new Gitea repos under `big-o` (already created). Each repo's `main` branch is **regenerated** (not merged into) on every sync: subtree of the relevant folder's history, plus a small set of overlay files (that repo's own `.gitea/workflows/ci.yml`, and optionally `vercel.json`/`render.yaml`) copied in from a templates folder that lives in `Wits-Quest`. Nobody commits directly to a mirror — any hand-edit there would just be wiped out by the next sync, which is intentional (keeps `Wits-Quest` as the only place anyone needs to make a change).
- A new workflow in `Wits-Quest`, `.gitea/workflows/sync-mirrors.yml`, runs the sync on every push to the branch that matters (see Decision 2) and can also be triggered manually.

## 4. Decisions to confirm

1. **Sync trigger — recommend: on every push to `main`, plus manual dispatch.** Keeps mirrors fresh automatically; manual dispatch covers "re-sync now" without waiting for a push. (Alternative: nightly schedule — simpler but mirrors lag up to a day. Say if you'd rather have that.)
2. **What each mirror's own CI actually does — recommend: validation only (lint, typecheck, test, build), no deploy.** Since `Wits-Quest` is still the source of truth and (as far as this plan assumes) still what's connected to Vercel/Render for actual deployments, a mirror's Actions run is there to give that repo its own honest status check, not to duplicate deployment. If you _do_ want e.g. `Wits-Quest-frontend` to deploy to Vercel on its own, that's an easy addition later — flagging so it's a deliberate choice, not a default I quietly picked.
3. **Do the mirrors need root tooling (eslint/prettier) copied in, or should their CI just reuse `Wits-Quest`'s root config via the overlay?** Recommend the latter — copy `eslint.config.js`/`.prettierrc.json` into each mirror as part of the same overlay used for the CI workflow file, so they stay in lock-step with `Wits-Quest`'s actual config instead of drifting (since they're regenerated every sync anyway, "copying" costs nothing extra).
4. **Docs repo scope** — same open question as before: does `Wits-Quest-Documentation` mirror just today's `docs/` + `mkdocs.yml`, or also pull in `ai/UI_DESIGN_SYSTEM.md` / the root `SPRINT*.md`/`WITS_QUEST_*.md` guides (Task 7.2, not yet done)? Recommend starting with just `docs/` + `mkdocs.yml` + `requirements.txt` now; that set can grow in a later sync once Task 7.2 actually consolidates those files into `docs/` in `Wits-Quest` — the mirror will just pick them up automatically at that point, no extra work.

## 5. Step-by-step implementation

### Phase 0 — Create the empty repos (DONE)

1. ~~On Gitea, create the three mirror repos under `big-o`~~ — created:

   | Mirror   | URL                                                            |
   | -------- | -------------------------------------------------------------- |
   | frontend | `https://sdp.ms.wits.ac.za/big-o/Wits-Quest-frontend.git`      |
   | backend  | `https://sdp.ms.wits.ac.za/big-o/Wits-Quest-Backend.git`       |
   | docs     | `https://sdp.ms.wits.ac.za/big-o/Wits-Quest-Documentation.git` |

2. Create a Gitea access token with push rights to all three (an org-level token if `big-o` supports it, otherwise a personal token) and store it as a secret named `MIRROR_PUSH_TOKEN` in `Wits-Quest`'s **Settings → Actions → Secrets** — this is what the sync workflow uses to push.

### Phase 1 — Build the overlay templates (in `Wits-Quest`)

3. Add a new folder, e.g. `mirror-templates/`, with the per-repo files that get stamped into each mirror on every sync:
   ```
   mirror-templates/
     frontend/
       .gitea/workflows/ci.yml   # lint, typecheck, vitest+coverage, build — no deploy (Decision 2)
       eslint.config.js          # copied/trimmed from root (Decision 3)
       .prettierrc.json
     backend/
       .gitea/workflows/ci.yml   # lint, typecheck, vitest, build
       eslint.config.js
       .prettierrc.json
     docs/
       .gitea/workflows/ci.yml   # pip install -r requirements.txt && mkdocs build
   ```
   These are ordinary files, reviewed and edited in `Wits-Quest` like anything else — the "author it once, sync re-applies it forever" model means changing a mirror's CI is just a normal commit here.

### Phase 2 — The sync workflow

4. Add `.gitea/workflows/sync-mirrors.yml` to `Wits-Quest`, triggered `on: push: branches: [main]` and `workflow_dispatch:`. For each of the three (prefix → template folder → target repo) it runs the same steps:

   | Prefix     | Template folder              | Target                         |
   | ---------- | ---------------------------- | ------------------------------ |
   | `frontend` | `mirror-templates/frontend/` | `Wits-Quest-frontend.git`      |
   | `backend`  | `mirror-templates/backend/`  | `Wits-Quest-Backend.git`       |
   | `docs`     | `mirror-templates/docs/`     | `Wits-Quest-Documentation.git` |

   ```bash
   git subtree split --prefix=<prefix> -b sync/<prefix>
   git checkout sync/<prefix>
   cp -r mirror-templates/<prefix>/. .
   git add -A
   git commit -m "chore: sync CI/tooling overlay from Wits-Quest" --allow-empty
   git push "https://${MIRROR_PUSH_TOKEN}@sdp.ms.wits.ac.za/big-o/<Target>" sync/<prefix>:main --force
   git checkout main
   git branch -D sync/<prefix>
   ```

   `docs` additionally needs `mkdocs.yml` and `requirements.txt` copied from the monorepo root into the subtree branch before committing, since they live outside `docs/` (§2).

5. Run it once manually (`workflow_dispatch`) to populate all three mirrors for the first time; confirm each mirror repo now has the expected files.

### Phase 3 — Verify each mirror's own CI

6. Confirm `Wits-Quest-frontend`/`Wits-Quest-Backend`/`Wits-Quest-Documentation` each show a green Actions run after the first sync.
7. Apply the same `git merge-base` robustness fix used in [gitea-actions-migration-plan.md](gitea-actions-migration-plan.md) (§4b) to each mirror's lint job template in `mirror-templates/` — a freshly created mirror repo's `main` starts from whatever the first sync pushed, so this failure mode (diffing against an unrelated base) can recur there too if a mirror is ever re-seeded.
8. Push a trivial change to `frontend/` in `Wits-Quest`, confirm it shows up in `Wits-Quest-frontend` within one sync run, with the mirror's own CI going green on it.

## 6. Rollback

Every phase here only ever pushes to the three new repos — `Wits-Quest` itself is never force-pushed, rewritten, or otherwise touched by the sync (the subtree split and overlay copy happen on a throwaway local branch that's deleted after each push). If the sync workflow misbehaves, disabling or deleting `.gitea/workflows/sync-mirrors.yml` stops it instantly with zero impact on `Wits-Quest`; a broken mirror repo can simply be deleted and re-created from Phase 0.

## 6b. Bugs found and fixed while validating (2026-09-12)

First real push (run #31) failed on all three `sync-*` jobs, fast (~20-30s each — consistent with failing right at the push step). Couldn't fetch the actual job logs via the Gitea API to confirm (`/actions/jobs/{id}/logs` returns 404 for this account on every ID tried — same owner-only restriction pattern as the secrets API earlier, just returned as "not found" instead of an explicit 403). Best-supported fix based on direct inspection of the workflow: the push URL used `https://token:${MIRROR_PUSH_TOKEN}@host/...` (the literal word "token" as username) — Gitea's documented convention is the **token itself as the username**, no separate literal prefix: `https://${MIRROR_PUSH_TOKEN}@host/...`. Fixed in all three jobs. Also found (and fixed, confirmed via local reproduction with the exact diff-scoped command the CI runs) a genuine Prettier formatting violation in `mirror-templates/backend/eslint.config.js` that was independently failing the `lint` job on `main`.

**Still unverified:** whether `git-subtree` is actually present on the Gitea runner's image (defensive `apt-get install` fallback exists in the workflow but is untested against the real runner) — if the credential fix alone doesn't get the sync jobs green, that's the next thing to check.

## 7. Risks

- **`data/*.json` path assumption.** If backend's own CI in `Wits-Quest-Backend` ever runs `seed.ts` (e.g. as part of a test), the mirror won't have `data/` at the 3-levels-up path the code expects, since only `backend/` gets mirrored. Not an issue for typecheck/vitest/build alone (nothing in the current backend test suite calls the seed script, per the passing local run) — but worth knowing if that changes.
- **Force-push model means no mirror-side history for hand edits.** Intentional per the confirmed direction (main is the only source of truth), but worth being explicit: anyone who commits directly to a mirror will have it silently overwritten on the next sync.
- **`MIRROR_PUSH_TOKEN` is a fairly powerful credential** (push access to 3 repos) sitting in `Wits-Quest`'s secrets — scope it to just those three repos if Gitea's token scoping allows it, rather than a full-account token.
- **Docs publish target still unresolved** (README advertises both GitHub Pages and Gitea Pages for docs) — orthogonal to this plan since `Wits-Quest-Documentation`'s CI is validation-only per Decision 2, but worth resolving separately before anyone expects the mirror to actually publish anything.
