# CI/CD Migration Plan: GitHub Actions → Gitea Actions

**Related tasks:** [`SPRINT2_FEATURE_SELECTION_AND_TASK_GUIDE.md`](../SPRINT2_FEATURE_SELECTION_AND_TASK_GUIDE.md) Task 7.1
**Status:** Draft — for review before implementation

## 1. Objective

Gitea now has Actions runners installed. Move CI execution (lint, typecheck, tests, coverage gate, builds) from GitHub Actions onto the native Gitea Actions runners, so the pipeline runs directly on `https://sdp.ms.wits.ac.za` instead of relying on GitHub-hosted runners + a status-reflection webhook back to Gitea.

## 2. Current State

- Only workflow file: [`.github/workflows/ci.yml`](../.github/workflows/ci.yml). No `.gitea/workflows/` directory exists yet, despite the README's file tree already documenting one.
- 4 jobs, all `runs-on: ubuntu-latest`:
  | Job | Guard | Purpose |
  |---|---|---|
  | `lint` | none — always runs | ESLint + Prettier on changed `.ts/.tsx/.js/.jsx` files |
  | `tests` | `if: github.server_url == 'https://github.com'` | typecheck, Vitest (80%+ coverage gate), frontend/backend builds |
  | `deploy-docs` | same GH-only guard, needs `tests`, only on push to `main`/`mahlatse_task2` | `mkdocs gh-deploy --force` → GitHub Pages |
  | `deploy-vercel` | same GH-only guard, needs `tests` | Vercel CLI prod deploy |
- Every job ends with a step that `curl`s a commit status to the **Gitea** API (`POST /api/v1/repos/big-o/Wits-Quest/statuses/:sha`) using `secrets.GITEA_TOKEN`, so Gitea shows green/red checks even though the actual run happens on GitHub.
- Effectively: `lint` today can already run on both hosts (no guard), but `tests`/`deploy-docs`/`deploy-vercel` are hard-gated to GitHub only.

## 3. Target State

- New file `.gitea/workflows/ci.yml`, adapted from the GitHub workflow, running natively on the Wits Gitea runners.
- `.github/workflows/ci.yml` is **kept** (per README's documented architecture and Task 7.1 scope, which only asks to *add* the Gitea workflow, not remove the GitHub one) but re-scoped to what still needs to live on GitHub.
- Gitea Actions posts its own commit statuses/checks automatically for jobs it runs — the manual `curl`-to-Gitea step becomes redundant for jobs that move to Gitea, and should be removed from the Gitea file (kept only in the GitHub file, for jobs that stay there).

## 4. Decisions to confirm before/while implementing

These affect what the two workflow files end up containing — flagging them up front so we don't have to redo work:

1. **Docs deployment (`mkdocs gh-deploy`) target — CONFIRMED.** Stays on `.github/workflows/ci.yml` only; someone else is already handling MkDocs/docs deployment separately, not part of this migration. `mkdocs gh-deploy --force` pushes to the `gh-pages` branch of `origin` as seen by the runner — on a Gitea runner that would be the Gitea repo, not GitHub, so it must not move. `deploy-docs` job is untouched by this plan.
2. **Runner labels — CONFIRMED.** Two Global runners registered (`sdp-runner-1` idle, `sdp-runner-2` active, both act_runner v3.3.2), both labeled `ubuntu-latest`, `ubuntu-24.04`, `ubuntu-22.04`. `runs-on: ubuntu-latest` in the existing workflow needs no change.
3. **Runner network egress.** `actions/checkout@v4`, `actions/setup-node@v4`, `actions/setup-python@v5` are pulled from `github.com` by default. If the Gitea runner host has no outbound internet access (likely, given it's on the Wits internal network), these actions will fail to resolve.
   - **Action:** verify egress, or confirm the runner is configured with `ACTIONS_RUNNER_ACTIONS_URL`/a local actions mirror. This is the biggest unknown and should be checked first — it can block everything else.

## 4b. Bugs found and fixed while validating (2026-09-12)

Two pre-existing bugs were found by reproducing the `tests`/`lint` jobs locally — neither was actually about coverage or lint content, both were infra bugs that crashed the jobs before real checks ran:

1. **`ci/tests` crashed on install, never reached coverage.** `frontend/package.json` and `backend/package.json` both carried a stray `"wits-quest-root": "file:.."` dependency (unused anywhere in source — confirmed by grep). Installing frontend/backend pulled in the root package as a linked local dependency, which fired root's `"prepare": "husky"` script before husky itself was installed in that job, crashing `npm install` outright. **Fix:** removed the stray dependency from both `package.json`s (and regenerated the lockfiles). Verified locally: fresh install, typecheck, Vitest (frontend 95.36% coverage / 89 passed, backend 23 passed), and both production builds all pass clean.
2. **`ci/lint` crashed on `git diff BASE...HEAD`.** `origin/main` on Gitea is a single orphan commit (`ea4d06d "Update README.md"`) with **no shared history** with any real feature branch (this branch has 184 commits from `ab1983e "initial commit"`) — `git merge-base origin/main HEAD` fails. Actions runs `run:` steps under `bash -e`, so the failed three-dot diff killed the whole job. **Fix (in both workflow files):** the changed-files step now checks `git merge-base` before trusting the candidate base; if it fails, it falls back to diffing against `HEAD~1`, and finally to linting all tracked files if there's no previous commit either. **Not fixed (out of scope):** `main`'s broken/orphaned history itself — that's a shared, destructive rewrite affecting the whole team and needs a deliberate decision from whoever manages the repo, not a silent fix bundled into a CI workflow change.
4. **Vercel deploy job.** Doesn't care which git host runs it, but currently gated behind `tests` + GH-only guard. Once `tests` also runs on Gitea, decide whether Vercel deploys from the Gitea run, the GitHub run, or both (risk of double-deploying on every push to `main`).
   - **Recommendation:** run `deploy-vercel` from exactly one host to avoid duplicate deploys — Gitea, since that's becoming the primary CI.

## 5. Step-by-step implementation

### Phase 0 — Verify prerequisites
1. Confirm the Actions unit is enabled for the repo: Gitea repo → **Settings → Units → Actions**.
2. Confirm at least one runner is registered and idle: **Settings → Actions → Runners**; note its labels.
3. Confirm runner egress to `github.com`/`actions.github.com` (or note that a local actions mirror is required) — test with a trivial workflow that only does `actions/checkout@v4`.

### Phase 1 — Secrets
4. In Gitea repo **Settings → Actions → Secrets**, create:
   - `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` (copy from GitHub repo secrets or Vercel dashboard).
   - `GITEA_TOKEN` is *not* needed for jobs that run natively on Gitea (native runs post their own status) — only keep it as a GitHub-side secret for the jobs still living in `.github/workflows/ci.yml`.

### Phase 2 — Create `.gitea/workflows/ci.yml`
5. Copy `.github/workflows/ci.yml` → `.gitea/workflows/ci.yml`.
6. In the new file:
   - Remove `if: github.server_url == 'https://github.com'` from `tests`.
   - Remove the `deploy-docs` job entirely (stays GitHub-only — see Decision 1).
   - Keep `deploy-vercel`, remove its GH-only guard (per Decision 4, this becomes the one place Vercel deploys from).
   - Remove the "Report Status to Gitea" `curl` step from every job (native runs already create Gitea check statuses).
   - Fix `runs-on` to the actual registered runner label (Decision 2).
7. In `.github/workflows/ci.yml`:
   - Remove `deploy-vercel` (now lives only on Gitea, per Decision 4) — or leave it but keep the GH-only guard so it can't double-fire; removing is cleaner.
   - Keep `lint`, `tests` (or drop `tests` here too if Gitea is now authoritative — see Phase 4), and `deploy-docs`.
   - Keep the Gitea status-reflection `curl` steps for whatever remains here.

### Phase 3 — Validate
8. Push a throwaway branch that touches a `.ts` file, open a PR against it (or just push) to trigger both workflows.
9. In Gitea, watch **Actions** tab on the repo: confirm `lint` and `tests` run on the Gitea runner, pass, and produce green commit statuses on the PR/commit.
10. Confirm coverage gate still fails the job correctly (deliberately drop coverage on the test branch, or trust the threshold logic already ported — at least verify the step runs).
11. Confirm `deploy-vercel` on Gitea successfully deploys (check Vercel dashboard for a new deployment) without a duplicate deployment also firing from GitHub.
12. Confirm GitHub's `deploy-docs` still publishes to `mahlatseclayton.github.io/wits_quest` unaffected.

### Phase 4 — Decide on GitHub Actions' remaining scope
13. Once Gitea is proven stable, decide whether `.github/workflows/ci.yml` should still run `tests`/`lint` redundantly (belt-and-suspenders, costs GH Actions minutes) or trim it down to just `deploy-docs` (its only host-specific job left). Update the workflow accordingly — this is a judgment call for the team, not a technical blocker.

### Phase 5 — Docs & cleanup
14. Update `README.md`'s CI/CD section (~line 321 onward) to describe the Gitea-native execution instead of "GitHub runs it, Gitea reflects it."
15. Update `personal/testing_and_ci_cd_plan.md` (currently describes the old reflection-only architecture) to match the new setup, or mark it superseded by this doc.
16. Mark Task 7.1 done in `SPRINT2_FEATURE_SELECTION_AND_TASK_GUIDE.md`.
17. Add branch protection required-status-checks in Gitea (**Settings → Branches**) referencing the new Gitea Actions job names, if not already configured.

## 6. Rollback

Nothing in Phase 2 deletes the working GitHub pipeline until Phase 4/5 — if the Gitea runner turns out unable to reach the internet (Decision 3) or otherwise can't run jobs reliably, `.gitea/workflows/ci.yml` can simply be deleted/disabled and GitHub Actions continues exactly as today. No rollback needed for Phase 1 (secrets are additive) or Phases 4-5 (do those only after validation passes).

## 7. Risks

- **Runner egress to github.com for actions** (Decision 3) — highest-impact unknown, check first.
- **Runner label mismatch** — silent "job stuck, no runner picks it up" if `runs-on` doesn't match a registered label.
- **Double Vercel deploys** if both hosts run `deploy-vercel` during the transition window — keep the GH-only guard on it until Gitea is confirmed working, then remove from GitHub.
- **`mkdocs gh-deploy` pushing to the wrong remote's `gh-pages`** if that job is ever moved to Gitea without adjusting the remote/token — kept GitHub-only in this plan specifically to avoid that.
