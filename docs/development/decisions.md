# Team Decisions Log

A running record of non-technical and process decisions made by Team Big-O during the Wits Quest project. Each entry captures the **what**, **why**, and **context** so that future contributors (and markers) can understand the reasoning behind how the team chose to work.

> For *technical* decisions (architecture, stack choices, database design), see [Technical Decisions](technical-decisions.md).

---

## 2026-09-13 — Use Gitea Issues instead of Gitea Projects for work tracking

**Decision**: Track all sprint tasks, bugs, and feature work using **Gitea Issues** rather than **Gitea Projects** (the Kanban/project board feature).

**Context**: Gitea offers a Projects feature that is integrated into the organisation level and can be linked to multiple repositories — similar to GitHub Projects. The team evaluated both options before Sprint 2.

**Why Issues over Projects**:

1. **Simplicity and low overhead** — The team has 6 members and a tight sprint cadence. Issues with labels and milestones are lightweight and require no additional board configuration or maintenance. Every team member can create, assign, and close issues without learning a new interface.

2. **Direct link to code changes** — Issues can be referenced in commit messages (`closes #42`) and pull requests, creating an automatic audit trail between the task and the code. Gitea Projects boards do not offer this tight commit-PR linkage.

3. **Notifications and visibility** — Gitea sends notifications for issue assignments, mentions, and status changes. Project board card movements do not trigger the same level of notification, meaning tasks could silently slip through.

4. **Milestone tracking** — Issues map directly to Gitea Milestones (Sprint 1, Sprint 2, etc.), giving an automatic progress bar of open vs. closed tasks per sprint. Projects boards would require manual syncing with milestones.

5. **No organisation-level complexity needed** — Gitea Projects are designed for organisation-wide boards spanning multiple repositories. Since Wits Quest is a single-team project with a focused scope (even after splitting into frontend/backend/docs repos), the added organisational overhead of Projects was unnecessary.

6. **Searchability and filtering** — Issues support label-based filtering, full-text search, and assignee filtering out of the box. Finding "all auth-related bugs assigned to Kgothatso" is a one-click filter, whereas a Project board would require custom column logic.

**Trade-offs accepted**:

- No visual Kanban board overview (compensated by using label filters and milestone progress bars).
- No drag-and-drop task reordering (compensated by issue numbering and sprint planning meetings).
- No cross-repo board view (not needed — each repo's issues are scoped to that repo).

**When to reconsider**: If the project grows beyond the course scope (multiple teams, cross-repo feature tracking), Gitea Projects with organisation-level boards should be re-evaluated.

---

## 2026-09-13 — Separate documentation repository

**Decision**: Documentation lives in a dedicated repository (`big-o/Documantation`) rather than inside the source code repository.

**Why**:

1. **Separation of concerns** — Code and documentation have different lifecycles. Documentation updates (meeting records, sprint guides, architectural decisions) should not trigger CI/CD pipelines or appear in code review diffs alongside feature work.

2. **Independent deployment** — The documentation site (MkDocs Material) is deployed independently to GitHub Pages, decoupled from the application deployment cycle on Vercel/Render.

3. **Reduced repository size** — Documentation includes images (meeting screenshots, UML diagrams) that inflate the source code repository. Keeping them separate keeps `git clone` fast for developers.

4. **Accessibility** — Documentation can be browsed and updated by team members who are focused on writing (e.g., sprint guides, handover docs) without needing to navigate a full source code tree.

**Trade-offs accepted**:

- Cross-repo linking between code and documentation (e.g., an issue referencing a doc page requires a URL rather than a relative path).
- Documentation can drift from code if not actively maintained alongside development.

---

## 2026-08-20 — Card awarded once per player per event

**Decision**: A player can only collect a card from a specific event once. Repeat correct answers at the same event give no reward.

**Why**: Prevents farming — without this restriction, a player could stand at one landmark and answer the same trivia repeatedly to stockpile duplicates, undermining the exploration premise. Other players can still collect at the same location.

---

## 2026-08-17 — Task distribution for Sprint 2

**Decision**: Sprint 2 tasks were distributed by domain ownership (see [Sprint 2 Handover Guide](../../sprints/WITS_QUEST_SPRINT2_HANDOVER_GUIDE.md)).

**Why**: Each team member owns a specific domain (geolocation, battle engine, database/auth, admin, progression, anti-cheat). Distributing tasks along domain boundaries minimises merge conflicts and allows each member to develop deep expertise in their area.

---

_Add new entries above this line, most recent first, as decisions are made during the project._
