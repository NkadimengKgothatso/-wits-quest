# Decisions Log

Process and tooling decisions the team made, with the reason and the options we turned down. Technology choices (React, Supabase, Leaflet and so on) are on the [Technical Decisions](technical-decisions.md) page.

---

## D-01: Gitea Issues for tracking work

**When:** Sprint 2 · **Status:** Active

**Decision:** We track all work as **Gitea Issues** instead of a Gitea Projects board.

**Why:**

- Issues link straight to commits and pull requests (`closes #42`), so every change points to its task.
- Each issue has an owner, labels, a sprint milestone and its own discussion thread.
- A Projects board is just a view on top of Issues. In Gitea it lives at the organisation level and has to be linked to each repo by hand, which added work for no benefit.

**Turned down:** Gitea Projects (extra setup, same data), Trello, Notion or Jira (separate accounts, no link to commits), spreadsheets (no linking or discussion).

---

## D-02: A separate documentation repository

**When:** Sprint 2 · **Status:** Active · **Owner:** Kgothatso

**Decision:** The documentation lives in its own repo ([Wits-Quest-Documentation](https://sdp.ms.wits.ac.za/big-o/Wits-Quest-Documentation), mirrored on [GitHub](https://github.com/NkadimengKgothatso/-wits-quest)) instead of inside the source code repo.

**Why:**

- Docs changes don't run the code tests and builds.
- The docs site deploys on its own, separately from app releases.
- The source repo stays focused on code.

**Turned down:** keeping docs in the main repo (mixes docs and code commits, triggers code CI for every docs edit); a wiki (no MkDocs theme, can't deploy to GitHub Pages).

---

## D-03: Mirror the monorepo into frontend and backend repos

**When:** Sprint 2 · **Status:** Active · **Owners:** Junior, Kgothatso

**Decision:** We keep working in one source repo (`Wits-Quest`). A Gitea workflow (`sync-mirrors.yml`) copies the frontend and backend into their own repos on every push to `main`:

- `Wits-Quest-frontend`: the React app
- `Wits-Quest-Backend`: the Express API

**Why:** Each part can be read, built and deployed on its own, while the team still works in one place.

**Turned down:** splitting into fully separate repos (harder to change both sides in one pull request); monorepo tools like Lerna or Nx (too much setup for two packages).
