# Decisions Log

This document records the key architectural, tooling, and process decisions made by Team Big-O during the development of Wits Quest. Each entry captures **what** was decided, **why**, and **what alternatives** were considered.

---

## D-01: Issues Over Projects for Work Tracking

**Date:** Sprint 2 (September 2026)
**Status:** Active
**Decided by:** Team Big-O

### Decision

We use **Gitea Issues** as our primary work tracker instead of Gitea Projects (kanban boards).

### Why Not Projects?

Gitea Projects are designed as an **organisation-level** tool. They live at the organisation scope and must be explicitly linked to individual repositories. For our setup, this introduced unnecessary overhead:

- **Organisation-level scope** — Projects are integrated into the organisation layer, not the repository. This means a Project board is shared across all repos in the organisation, which doesn't fit a single-team, single-project workflow where every task belongs to one codebase.
- **Linking complexity** — Each Project must be manually linked to repositories. With our 3-repo structure (source code, frontend, backend after the split, plus this docs repo), managing cross-repo board links adds friction without proportional benefit.
- **Redundant with Issues** — Gitea Projects are essentially a visual layer on top of Issues. Every card on a Project board is still an Issue underneath. Using Issues directly eliminates the middle layer.

### Why Issues Work Better for Us

| Factor | Issues | Projects |
| :--- | :--- | :--- |
| **Commit & PR linking** | Issues link natively to commits and pull requests via keywords (`closes #42`, `fixes #10`). This gives automatic traceability from code change to task. | Project cards inherit the Issue link but don't add any automation on top. |
| **Assignment & ownership** | Each Issue can be assigned to a team member with labels, milestones, and due dates — all at the repo level. | Same, but the board view doesn't add assignment capabilities. |
| **Per-task discussion** | Every Issue has its own comment thread, file attachments, and status history. Team members discuss implementation details directly on the task. | Project boards show cards but discussion happens on the underlying Issue anyway. |
| **Milestone tracking** | Issues group naturally into milestones (Sprint 1, Sprint 2, etc.) with progress tracking built in. | Projects can group by milestone but it's a separate configuration step. |
| **Simplicity** | One tool, one place to look. No switching between a board view and the Issue list. | Two tools to maintain — the board and the Issue list show the same data differently. |
| **CI/CD integration** | Issue labels and milestones can trigger or gate CI workflows (e.g., block merge if linked Issue is not in the current milestone). | No additional CI/CD benefit over raw Issues. |

### Alternatives Considered

1. **Gitea Projects (kanban board)** — Rejected for the reasons above: organisation-level scope, linking overhead, and redundancy with Issues.
2. **External tools (Trello, Notion, Jira)** — Rejected because they require separate accounts, break the commit-to-task traceability chain, and add another tool for the team to maintain.
3. **Spreadsheets** — Rejected because they lack commit linking, assignment, discussion threads, and milestone tracking.

### Outcome

All sprint tasks are tracked as Issues with labels (`bug`, `feature`, `docs`, `infrastructure`), milestones (Sprint 1, Sprint 2, Sprint 3), and assignees. The Sprint 2 Handover Guide task board maps each team member to their assigned Issues. PRs reference their Issue IDs in commit messages for full traceability.

---

## D-02: Separate Documentation Repository

**Date:** Sprint 2 (September 2026)
**Status:** Active
**Decided by:** Team Big-O (Kgothatso)

### Decision

Documentation lives in a dedicated repository ([big-o/Documantation](https://sdp.ms.wits.ac.za/big-o/Documantation)) rather than inside the main source code repository ([big-o/Wits-Quest](https://sdp.ms.wits.ac.za/big-o/Wits-Quest)).

### Rationale

- **Separation of concerns** — Documentation changes (writing, restructuring, updating guides) don't need to go through the same review pipeline as code changes. Docs PRs don't trigger the full CI/CD test suite.
- **Independent deployment** — The MkDocs site deploys from the docs repo independently, without being coupled to code release cycles.
- **Cleaner source repo** — The main Wits-Quest repo stays focused on application code, tests, and configuration. Removing ~65 documentation files significantly reduces repository noise.
- **Dedicated MkDocs configuration** — The docs repo has its own `mkdocs.yml`, `requirements.txt`, and documentation structure optimised for the Material theme without cluttering the source repo's root.

### Alternatives Considered

1. **Keep docs in the main repo** — Rejected: mixes documentation commits with code commits, triggers unnecessary CI runs, and makes the repo harder to navigate.
2. **GitHub/Gitea Wiki** — Rejected: Wikis lack version control integration, don't support MkDocs/Material theming, and can't be deployed to GitHub Pages.

### Outcome

All project documentation — UML diagrams, database design, sprint guides, implementation plans, meeting records, and this decisions log — lives in the Documantation repository, served via MkDocs at [https://nkadimengkgothatso.github.io/-wits-quest/](https://nkadimengkgothatso.github.io/-wits-quest/).

---

## D-03: Repository Split (Monorepo → 3 Repos)

**Date:** Sprint 2 (September 2026)
**Status:** Planned
**Decided by:** Team Big-O (Junior, Kgothatso)

### Decision

At the Sprint 2 freeze, the monorepo splits into three repositories:

1. **`wits-quest-frontend`** — Vite + React frontend
2. **`wits-quest-backend`** — Node.js + Express backend
3. **`Documantation`** — MkDocs documentation (already separated)

### Rationale

- **Independent CI/CD** — Frontend and backend each get their own pipeline, deploy independently, and don't block each other.
- **Focused ownership** — Team members working on frontend don't need to pull backend dependencies (and vice versa).
- **Git history preserved** — The split uses `git filter-branch` or `git subtree` to retain full commit history for each component.

### Alternatives Considered

1. **Keep monorepo** — Rejected: increasingly difficult to manage as the codebase grows; CI runs the full suite even for single-component changes.
2. **Lerna / Nx monorepo tooling** — Rejected: adds tooling complexity for a 6-person team with only two packages (frontend + backend).

---

*This log is updated as new significant decisions are made. For technical technology choices (Leaflet vs Google Maps, Vitest vs Jest, Supabase vs MongoDB, etc.), see [Technical Decisions](./technical-decisions.md).*
