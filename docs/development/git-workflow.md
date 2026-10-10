# Git Methodology

This is our **Git methodology**: how we use Git day to day. It covers the repositories, branch names, commit messages, merging and the automatic checks, and git hooks enforce most of the rules.

!!! info "Git methodology and project methodology are different things"
    - **Git methodology (this page)** is how code moves through Git: branches, commits, pull requests and merges.
    - **[Project methodology](../project/methodology.md)** is how the team runs the whole project: Agile Scrum in four sprints, roles, meetings, reviews and the Definition of Done.

    Our Git methodology is a **feature-branch workflow**. `main` is always deployable, every piece of work gets its own short-lived branch named after its owner, and work goes back into `main` through a pull request or the integration lead.

---

## Repositories

| Repository | What it holds | How changes reach `main` |
| :--- | :--- | :--- |
| `Wits-Quest` (Gitea) | All app code: frontend and backend | Pull request, or the integration lead merges the branch |
| `Wits-Quest-frontend` / `Wits-Quest-Backend` (Gitea) | Read-only copies of the frontend and backend | Updated automatically by `sync-mirrors.yml` |
| `Wits-Quest-Documentation` (Gitea, mirrored on GitHub) | This documentation site | Committed on GitHub `main`, then pushed to Gitea |

## Branches

`main` must always work. Every feature or fix gets its own branch, named after the person and the work. The only commits made straight to `main` are small integration fixes by the integration lead (Mahlatse), needed when combined branches don't work together.

| Kind | Format | Example |
| :--- | :--- | :--- |
| Feature | `<name>/<feature>` | `Nontokozo/quest-trails` |
| Fix | `<name>/fix-<problem>` | `mahlatse/fix-signup-db-fallback` |
| Docs | `<name>/<topic>` | `Kgothatso/documatation_migration` |

## Commit messages

We use **Conventional Commits**: `type(area): what changed`, written as an instruction.

```
feat(trails): the map flags each trail's next stop
fix(async-pvp): an overdue round no longer crashes the server
docs: record Sprint 3 meetings
chore: remove the unused DeckBuilder screen
```

- **Types:** `feat`, `fix`, `docs`, `test`, `refactor`, `chore`, `ci`.
- **Area:** the part of the game, like `map`, `battle`, `auth`, `trails` or `admin`.
- Keep the summary short, with no full stop at the end.

## Merging

1. Test the feature locally first (agreed on 28 Sep).
2. Open a pull request into `main` on Gitea, or ask the integration lead to merge your branch.
3. All checks must pass (below).
4. If it fixes a bug issue, mention it (`closes #42`) so Gitea closes the issue on merge.

## Automatic checks

| When | Check | What happens if it fails |
| :--- | :--- | :--- |
| Every commit | ESLint and Prettier on the changed files (husky + lint-staged) | The commit is blocked |
| Every push | Full lint, type-check, and all frontend and backend tests (husky pre-push) | The push is blocked |
| On demand | The same checks on the Gitea runners (`.gitea/workflows/ci.yml`) | The run is marked failed |
| Push to `main` | Deploy to Vercel, Render and GitHub Pages (`.github/workflows/ci.yml`) | The deploy is skipped or marked failed |

The Gitea runners were slow during Sprint 3, so the full test run moved to the pre-push hook on each developer's machine. Gitea CI can still be run by hand.

## Pull request checklist

- [ ] Anything that matters for fairness (location, answers, battle results) is checked on the server, not trusted from the app
- [ ] Tests added or updated
- [ ] Docs updated if the feature, an endpoint or a table changed
- [ ] Tried on a real phone if it's a game feature
- [ ] Pull request says which issue it closes
