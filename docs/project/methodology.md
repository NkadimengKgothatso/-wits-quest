# Project Methodology

How the team plans, builds, reviews and delivers Wits Quest.

---

## Approach: Agile, in sprints

We work in short sprints that line up with the course milestones. Each sprint has a goal, a prioritised task list, and a clear "done" line.

| Sprint | Dates | Goal | Done when |
| :--- | :--- | :--- | :--- |
| **Sprint 1** | to 25 Aug | Basic tier foundation | Map, trivia, CPU battle and login working |
| **Sprint 2** | 7 to 15 Sep | Make the core secure and reliable | Server checks answers and battles; works on a real phone |
| **Sprint 3** | 15 to 29 Sep | Intermediate tier plus selected Advanced features | Every Intermediate feature done; live PvP playable |
| **Sprint 4** | 29 Sep to 11 Oct | Polish and submit | Everything deployed, tests passing, docs complete; feature freeze on 4 Oct |

Each sprint's plan and team guide are on the [Sprints](../sprints/README.md) page. The original plan for the whole project is the [Master Architecture Guide (PDF)](files/wits-quest-master-architecture-task-specification-guide.pdf), later updated as [Master Guide V2](../sprints/master-guide-v2.md).

---

## Team

Six members, each owning one area from screen to database:

| Member | Area |
| :--- | :--- |
| Junior | Map, location, walking directions and trading |
| Mahlatse | Battles: CPU, live, async and spectating |
| Kgothatso | Database, API, login, achievements and streaks |
| Rea | Admin console, content curation and event placement |
| Nontokozo | Cards, forge, trails, territory and ranked seasons |
| Oratile | Anti-cheat, QR check-in and analytics |

## Planning and tracking

- **Gitea Issues** hold every task and bug, with labels (`bug`, `feature`, `docs`, `infrastructure`), a sprint milestone and an owner. Pull requests close issues with `closes #N`. Why we chose Issues: [Decision D-01](../development/decisions-log.md#d-01-gitea-issues-for-tracking-work).
- Each sprint starts with a **plan** and a **team guide** that split the work by person.
- Each sprint has **team meetings**, recorded with decisions and action items on the [Meetings](../meetings/index.md) page.
- **Tutor reviews** are recorded separately on [Stakeholder Reviews](stakeholder-reviews.md), with what we changed in response.

### Plan, build, walkthrough

Bigger features follow three steps:

1. **Plan** before coding: the approach, which files change, and the risks.
2. **Build** on a feature branch, reviewed through a pull request.
3. **Walkthrough** after merging: what changed and how it was checked against the real backend. The [Live PvP](../development/live-pvp-walkthrough.md) and [Async PvP](../development/async-pvp-walkthrough.md) walkthroughs are examples.

---

## Code quality

Sprint 1 had no automatic code checks, and the tutor pointed this out in the Sprint 1 review. Since Sprint 2:

- **Before every commit**, husky runs ESLint and Prettier on the changed files. Badly formatted code can't be committed.
- **Before every push**, husky runs the full check: lint, type-check and all tests for both frontend and backend. A failing check stops the push.

Details are on the [Git Workflow](../development/git-workflow.md) page.

---

## Definition of Done

A task is done only when all of these are true:

1. It was merged through a pull request with at least one teammate's approval.
2. It has tests, and all tests pass.
3. Any endpoint that changes data checks the login and validates the input on the server.
4. It has no open high-severity bugs.
5. Type-check, lint and coverage checks pass.
6. No passwords or keys are in the code or docs.
7. The pull request names the issue it closes.
8. Game features work on a real phone on campus (GPS, distance check, offline mode).
