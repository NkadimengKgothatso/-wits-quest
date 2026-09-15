# Git Workflow

The team's agreed standard for branches, commits, and merges across the three repositories (frontend, backend, docs). It is **enforced, not just suggested**: husky pre-commit hooks run linting on every commit, and the CI pipeline gates every merge to `main`.

## Repositories

| Repository | Contents | Merges to `main` via |
| :--- | :--- | :--- |
| `Wits-Quest` (source, Gitea) | Monorepo working tree — frontend + backend + shared tooling | Pull request, 1 peer approval, CI green |
| `Wits-Quest-Frontend` / `Wits-Quest-Backend` (Gitea) | Automated read-only mirrors of the split packages | Pushed automatically by `sync-mirrors.yml` |
| `Wits-Quest-Documentation` (this repo) | MkDocs site, sprint guides, implementation plans | Direct commits on a working branch, then fast-forward to `main` (docs-only changes run no code CI — Decision [D-02](decisions-log.md)) |

## Branch naming

Branches are named `type/owner-short-description`, so the author and purpose are visible in every log and PR list:

| Branch type | Format | Example |
| :--- | :--- | :--- |
| Feature | `feature/<member>-<short-description>` | `feature/junior-map-explorer` |
| Bug fix | `fix/<fix-id>-<short-description>` | `fix/f6-repeat-farming` |
| Documentation | `docs/<topic>` | `docs/stakeholder-reviews` |
| Tooling / CI | `chore/<topic>` | `chore/gitea-actions-migration` |

Rules:

- `main` is always deployable/demo-ready — **no direct pushes to `main`** in the code repos once past early scaffolding.
- One branch per feature or fix; fix branches carry the `F##` ID from the [fix register](fix-register.md) so the defect→branch→PR chain is traceable.

## Commit format

The team uses **Conventional Commits** — `type(scope): imperative summary` — so six contributors' history stays scannable and each commit declares what it touches:

```
feat(battle): add server-side round resolution for CPU battles
fix(deck): reject 6th card and enforce 300-point stat budget
docs: record Sprint 1 tutor review and close documentation gaps
ci: migrate GitHub Actions workflows to Gitea Actions
chore(deps): bump backend dependencies
```

- **Types used in this project:** `feat`, `fix`, `docs`, `ci`, `chore`, `refactor`, `test`.
- **Scope = domain:** `map`, `battle`, `auth`, `deck`, `cards`, `api`, `db`, `ui`, `forge`, `telemetry`, `admin` (matches the domain-ownership table in [Methodology](../project/methodology.md)).
- **Summary rules:** imperative mood ("add", not "added"), lowercase after the colon, no trailing period, under ~72 characters.
- **Issue linkage:** commits and PR descriptions reference the work they close — `closes #42`, `fixes #10` — so Gitea auto-closes the Issue and links the traceability chain (Decision [D-01](decisions-log.md#d-01-issues-over-projects-for-work-tracking)).

## Merge rules

1. **Pull request into `main`** for all code changes — no exceptions past scaffolding.
2. **At least one peer approval** required (Definition of Done, [Methodology](../project/methodology.md)).
3. **CI must be green** on the PR branch: lint, `tsc --noEmit`, and Vitest with the 80% coverage gates for both packages.
4. **PR description cites its IDs** — the Issue number and any fix-register `F##` IDs it resolves.
5. **Docs repo only:** documentation changes may be committed directly to a working branch and fast-forwarded to `main`, because docs changes deliberately run no code CI pipeline (Decision [D-02](decisions-log.md)).

## Enforcement

The standard is enforced automatically — a non-conforming commit cannot reach `main` silently:

| Gate | Where it runs | What it does |
| :--- | :--- | :--- |
| **husky + lint-staged** | Pre-commit, locally | ESLint `--fix` + Prettier on staged files — badly formatted code never gets committed |
| **ESLint + Prettier** | CI, every push | Full-repo lint and format check |
| **TypeScript** | CI, every push | `tsc --noEmit` on both packages |
| **Vitest** | CI, every push | Full test suite with 80% coverage gates |

Sprint 1 shipped with none of this — the gap was flagged in the tutor's Sprint 1 review and closed in Sprint 2 (see [Technical Decisions](technical-decisions.md) and the [review record](../project/stakeholder-reviews.md)).

## PR checklist

- [ ] Feature matches the requirement tier it targets (Basic/Intermediate/Advanced — see [Requirements](../project/requirements.md))
- [ ] No client-trusted state for anything server-authoritative (location, answers, match outcomes)
- [ ] Relevant docs page updated (this site, `docs/`)
- [ ] Tested against both `npm run dev:frontend` and `npm run dev:backend`
- [ ] Works on a real phone on campus (GPS, geofence, offline behaviour)
- [ ] PR description references the Issue ID and fix-register IDs it closes
