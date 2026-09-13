# Work Tracking: Issues vs. Projects

This document explains why Team Big-O chose **Gitea Issues** over **Gitea Projects** for tracking sprint tasks, bugs, and features throughout the Wits Quest project.

---

## What Are Gitea Projects?

Gitea includes a **Projects** feature — an organisation-level Kanban-style board that can be linked to multiple repositories. It allows teams to create custom columns (e.g., "To Do", "In Progress", "Review", "Done"), drag-and-drop cards between columns, and visualise work across repositories from a single board.

In principle, Gitea Projects is the equivalent of GitHub Projects or Jira boards: a visual workflow management tool designed for teams that need to see work moving through stages.

## Why We Chose Issues Instead

### 1. Tighter Code Integration

Issues are first-class citizens in Gitea's version control workflow:

- **Commit references**: Writing `closes #42` or `fixes #18` in a commit message automatically closes the issue when the commit is merged.
- **Pull request linking**: PRs automatically show which issues they address, and issue timelines show every code change that referenced them.
- **Cross-references**: Any commit, branch, or PR mentioning an issue number creates a backlink in the issue thread.

Projects boards do not offer this level of integration. Moving a card on a Kanban board does not create a code trail.

### 2. Notifications and Accountability

Gitea's notification system is built around issues:

- **Assignment notifications**: Assigning an issue sends an email/in-app notification to the assignee.
- **Mentions**: `@username` in an issue comment triggers a notification.
- **Status changes**: Closing, reopening, or labelling an issue notifies all participants.

Project board card movements are largely silent — a task could be moved from "To Do" to "Done" without anyone outside the board being aware.

### 3. Milestone Integration

Issues map directly to **Gitea Milestones**:

- Each sprint (Sprint 1, Sprint 2, Sprint 3) is a Milestone.
- The Milestone page shows a progress bar of open vs. closed issues — a one-glance sprint health indicator.
- Overdue issues are flagged automatically.

Projects boards have no native concept of milestones. To get the same sprint-level view, you would need to manually tag cards or create separate boards per sprint.

### 4. Search and Filtering

Issues support powerful built-in filters:

- Filter by label (e.g., `bug`, `feature`, `auth`, `battle-engine`)
- Filter by assignee (e.g., all issues assigned to Kgothatso)
- Filter by milestone (e.g., all Sprint 2 tasks)
- Full-text search across titles and descriptions

Finding "all auth-related bugs in Sprint 2 assigned to Kgothatso" is a three-click filter on the Issues page. On a Project board, this would require custom column logic or multiple boards.

### 5. No Organisation-Level Overhead

Gitea Projects are designed for **organisation-wide** boards that span multiple repositories. While this is powerful for large teams managing microservices, it adds complexity that a 6-person course project does not need:

- Project boards must be created at the organisation level.
- Board columns and workflows need to be designed and maintained.
- Card-to-issue linking is manual (cards are not the same as issues).

For our scope — one team, focused deliverables, tight sprints — the overhead of maintaining a separate board system was not justified.

### 6. Labels Provide Visual Organisation

Issues support coloured labels that serve the same purpose as Kanban columns:

| Label | Purpose |
| :--- | :--- |
| `bug` | Known defects that need fixing |
| `feature` | New functionality to implement |
| `docs` | Documentation work |
| `auth` | Authentication-related tasks |
| `battle` | Battle engine tasks |
| `sprint-1` / `sprint-2` | Sprint assignment |
| `blocked` | Cannot proceed (dependency or question) |
| `priority-high` | Must complete before demo |

Combined with assignee and milestone filters, labels give every team member a clear view of their work without a separate board.

---

## When Projects Would Make Sense

Gitea Projects would be worth considering if:

- The project grows to **multiple teams** working across repositories simultaneously.
- There is a need for a **cross-repo visual board** showing work spanning frontend, backend, and infrastructure repos in one view.
- The team adopts a **strict Kanban methodology** with WIP limits and column-based workflow stages.
- Stakeholders (e.g., lecturers) need a **high-level dashboard** without drilling into individual issue threads.

For the current scope of Wits Quest (COMS3011A, 6 members, 3 sprints), Issues with labels and milestones provide all the tracking we need with less overhead.

---

## Summary Comparison

| Feature | Gitea Issues | Gitea Projects |
| :--- | :--- | :--- |
| Commit/PR linking | Automatic (`closes #N`) | Manual (no auto-linking) |
| Notifications | Full (assign, mention, close) | Limited (card moves are silent) |
| Milestone progress | Automatic progress bar | Not supported |
| Search and filtering | Built-in, powerful | Limited to board view |
| Visual board | No (use label filters) | Yes (Kanban columns) |
| Cross-repo view | Per-repo only | Organisation-wide |
| Setup complexity | Zero (built-in) | Requires board design |
| Best for | Small teams, sprint-based work | Large teams, Kanban workflows |

**Our choice**: Gitea Issues with labels, milestones, and assignees.

> See also: [Team Decisions Log](decisions.md) for the full decision record.
