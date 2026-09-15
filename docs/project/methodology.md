# Project Methodology

How Team Big-O plans, prioritises, reviews, and delivers Wits Quest — the process behind the product, as required by the Milestone 2 brief.

---

## Approach: sprint-based agile

The project runs as a sequence of **timeboxed sprints anchored to the official course milestones**, with each sprint carrying a theme, a priority ladder, and pre-agreed exit criteria:

| Sprint | Window | Theme | Exit criteria |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | → 25 Aug | Basic Tier foundation | GIS map, trivia, CPU battle, auth working; every screen owned end-to-end by one member |
| **Sprint 2 — "Rescue Window"** | 07 → 15 Sep | Integrity-Secured Core | All P0 merged; P1 substantially merged; M2 acceptance demonstrable **on a real device** |
| **Sprint 3** | 15 → 29 Sep | Intermediate Complete + Selective Advanced | Every Intermediate requirement (I-1…I-7) verifiably done; live PvP playable |
| **Sprint 4** | 29 Sep → 11 Oct | Production Hardening & Submission | Full stack deployed; CI green from `main`; docs complete; **feature freeze 04 Oct** |

The Sprint 2 re-plan (documented in the [Master Guide V2](../sprints/master-guide-v2.md)) added three standing planning rules:

1. **Integrity before features** — every reward path becomes server-verified *before* new features consume it. A reward from an unverified endpoint devalues everything downstream.
2. **Finish before new** — wiring six already-built-but-unrouted screens takes days; replacing them with new work takes weeks.
3. **Select Advanced by foundation, not ambition** — live PvP (existing socket handler) and Elo (existing code) are cheap Advanced wins; 2PC trading and PostGIS have zero foundation and were descoped with explicit re-entry criteria.

If time runs short, the drop order is pre-agreed via the priority ladder (**P0 > P1 > P2**) rather than improvised under pressure.

---

## Team structure

Six members, each owning a vertical domain end-to-end (design, UI, UX, and interactive logic) — see [Scope](scope.md):

| Member | Domain |
| :--- | :--- |
| Junior | Geolocation, campus map & spatial engine |
| Mahlatse | Turn-based battle engine & PvP (CPU / Async / Live) |
| Kgothatso | Database architecture, secure API & authentication |
| Rea | Admin authoring console (events, trivia, cards) |
| Nontokozo | Card collection, deck construction & progression |
| Keoratile | Anti-cheat telemetry & analytics |

Domain ownership keeps every screen single-owner during a sprint; cross-domain work (shared battle resolution, reward logic) is extracted into shared modules by the domain owner who built it.

## Planning & tracking

- **Gitea Issues** is the single work tracker — labels (`bug`/`feature`/`docs`/`infrastructure`), sprint milestones, and assignees, with PRs auto-closing issues via `closes #N` (rationale in [Decision D-01](../development/decisions-log.md#d-01-issues-over-projects-for-work-tracking)).
- The **master fix register** (`F##` IDs) provides stable, auditable traceability from defect to fix to PR; every task in the [task matrix](../sprints/master-guide-v2.md) cites its traceability IDs.
- Each sprint opens with a **selection & handover guide** (see [Sprints](../sprints/README.md)) allocating the task matrix member-by-member with technical explanations.
- Sprint boundaries are marked by full-team syncs; meetings are [logged with decisions and action items](../meetings/index.md).

### Plan → build → walkthrough cycle

Non-trivial features follow a documented three-step cycle:

1. **Implementation plan** (before coding) — approach, files to touch, risks, and what is deliberately *not* done, committed to `implementation-plans/`.
2. **Implementation** — feature branch, reviewed PR, CI gates.
3. **Walkthrough** (after merge) — what actually changed, what was verified live against the real backend and Supabase, and what was deliberately deferred. The `battle-ai/` folder indexes this cycle for the entire battle domain.

This is why the documentation can show not just *what* the system does but *how it was verified* — including manual smoke tests for the socket-heavy screens.

---

## Code-quality gates

Sprint 1 shipped with **no automated code-quality checks** — a gap flagged in the tutor's Sprint 1 review ([Stakeholder Reviews](stakeholder-reviews.md)). Sprint 2 closed it:

- **ESLint + Prettier** run on every commit via husky `lint-staged` pre-commit hooks — badly formatted code cannot be committed at all.
- **CI enforces the full gate on every push**: lint, `tsc --noEmit`, and the Vitest test suite with 80% coverage gates for both packages.

The enforcement table (what runs where) is in [Git Workflow](../development/git-workflow.md); the tooling itself is documented in [Third-Party Code & Services](../development/third-party.md).

---

## Git workflow

- **Feature branches** off `main`, one branch per feature or fix (`feature/<member>-<desc>` or `<name>/<feature>`); no direct pushes to `main` past early scaffolding.
- **Conventional Commits** across six contributors — `feat(map): …`, `fix(auth): …`, `docs(database): …`.
- **Pull requests** merge everything, with at least one peer approval required. Full details in [Git Workflow](../development/git-workflow.md).
- The repository is split into three repos (frontend, backend, docs) so documentation changes don't run the code CI pipeline (Decision D-03).

## Definition of Done

No software task is marked complete until it satisfies all seven clauses ([Master Guide V2 §5](../sprints/master-guide-v2.md)):

1. **Code review** — merged via PR with at least 1 peer approval.
2. **Automated testing** — unit or integration tests written and passing.
3. **API verification** — valid status codes and payloads; any state-changing endpoint verified **authenticated and server-validated**.
4. **No high blockers** — zero unresolved high-severity bugs on the task.
5. **CI green** — `tsc --noEmit` clean and Vitest 80% coverage gates pass for both packages on the PR branch.
6. **Secrets hygiene** — no credentials in code or docs; configuration flows through `.env.example` templates.
7. **Traceability** — the PR description references the Task ID and fix-register IDs it closes.

Sprint 2 adds a field clause: the feature must **work on a real phone on campus** — GPS, geofence, and offline behaviour included. See [Testing](../development/testing.md) for how the quality gates are enforced in CI.
