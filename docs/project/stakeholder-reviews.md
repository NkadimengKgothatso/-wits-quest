# Stakeholder Reviews

Formal feedback sessions with the course tutor — the project's primary stakeholder reviewer. These records are kept **separate from internal team meetings** (per the tutor's own instruction) and every future session is recorded the same way: **minutes plus a photo with the stakeholder**, dated.

---

## Sprint 2 Review — 2026-09-15

**Type:** Tutor check-in — verification of Sprint 1 feedback and Sprint 2 progress review
**Timing:** Scheduled during the **university recess** — with lectures paused, the team and tutor used the recess window to meet in person on campus and close out Sprint 2.
**Attendees:** Team Big-O and the course tutor (in person)

### What was verified

The tutor reviewed each item from her [Sprint 1 feedback](#sprint-1-review-2026-08-13) against the current project and **verified that the changes she requested at the first review have been implemented**:

| Sprint 1 request | Verified state |
| :--- | :--- |
| Code-quality checks (linters, Prettier) | ESLint + Prettier enforced by husky pre-commit hooks and CI |
| Three-repo separation (no monorepo) | Frontend, backend, and documentation live in separate repositories, kept in sync |
| README slimmed to basics | READMEs now only cover what the app is and how to run it; the detail moved to this site |
| Why Issues, not Projects | Recorded in [Decision D-01](../development/decisions-log.md#d-01-issues-over-projects-for-work-tracking) |
| Git methodology standard | Branch-naming structure and Conventional Commits documented in [Git Workflow](../development/git-workflow.md) |
| Project methodology / roadmap | [Methodology](methodology.md) and [Sprints](../sprints/README.md) pages |
| Security — OAuth, no password hashing | Auth migrated to Supabase Auth; the custom JWT + bcrypt code was removed |
| Tech-stack rationale | Team-specific reasoning documented in [Technical Decisions](../development/technical-decisions.md) |
| Meeting structure + stakeholder minutes | Fixed meeting record format in use; stakeholder sessions recorded on this page, separate from team meetings |

### Notes

- The session was deliberately scheduled **now, during recess**, since the break gave the team and the tutor a window to meet on campus between sprints.
- The tutor **confirmed the Sprint 1 feedback items are implemented** — the verification doubles as evidence of a working feedback loop: feedback received → triaged into the sprint plan → implemented → verified by the stakeholder.
- Sprint 2 outcomes demonstrated: live app deployment, the user feedback survey with real responses ([User Feedback](user-feedback.md)), and the MkDocs documentation site.

![Team Big-O with the course tutor after the Sprint 2 review, 2026-09-15](images/2026-09-15-tutor-review.jpg)

---

## Sprint 1 Review — 2026-08-13

**Type:** Tutor review of Sprint 1 deliverables (Core Loop & Foundation: campus map, geofenced trivia, card collection, CPU battles, authoring console)
**Timing:** Sprint 1 close-out, ahead of Sprint 2 planning (2026-08-17)

### Feedback received

The tutor's notes, as recorded at the session:

> **Code quality.** Linter / Prettier, code quality checks — have it in documentation, that [we] didn't have code quality check[s in Sprint 1], now we do / know about it. Document what we've already done, in Sprint 1.

> **Repository structure.** Have you separated repos, one for frontend, backend, etc.? Can't have monorepos — need to have 3 repos: frontend, backend, and documentation.

> **README scope.** README should not have entire info — ours is too long. Just for someone to know how to use our app, basic how to run locally.

> **Work tracking.** Include in documentation why you decided to use Issues for work tracker. Explain why not Projects — Projects are integrated into the organisation and linked to repositories.

> **Git methodology.** Do we have a standard on how we make commits, how we merge? Needs to be documented. Even our branch names need to follow structure. Need to have a format — same with commits.

> **Project methodology.** What we chose as skeleton for the project, how we decided to go about the project, roadmap, features we decided to implement.

> **Security.** Documentation on security reasons — especially since it is not hard to unhash passwords. Can use OAuth, industry standards.

> **Tech stack.** Move tech stack from README into documentation. MapBox instead of ReactLeaflet for map rendering [— consider it]. Why Node — document it. Why React — document it. Give personal reasons, as specific to us as possible; add human effect. Why we chose Supabase over other stuff — compare with competition.

> **Meeting practice.** Fix structure of team meetings — be in order. For meetings with clients, have minutes when you meet with her, take a selfie. Separate it. Record minutes from stakeholders.

### How the team responded

Every point was triaged into the Sprint 2 plan and is now addressed in the documentation:

| Feedback theme | Response / where it is documented |
| :--- | :--- |
| Code-quality checks (linters, Prettier) | Sprint 1 shipped with none — now recorded honestly in [Technical Decisions](../development/technical-decisions.md) and [Methodology](methodology.md). Sprint 2 added ESLint + Prettier enforced by husky pre-commit hooks and CI ([Third-Party Code & Services](../development/third-party.md), [Testing](../development/testing.md)). |
| Three-repo separation (no monorepo) | Completed in Sprint 2: frontend, backend, and docs are separate repositories kept in sync by automated mirror pushes (Decisions [D-02](../development/decisions-log.md) and [D-03](../development/decisions-log.md)). |
| README too long | READMEs slimmed to the basics — what the project is and how to run it. The full detail lives on this documentation site, including the [tech-stack manifest](../development/third-party.md) moved out of the README. |
| Why Issues, not Projects | Documented in [Decision D-01](../development/decisions-log.md#d-01-issues-over-projects-for-work-tracking) — organisation-level scope, linking overhead, and redundancy with Issues. |
| Git methodology standard | The team's actual standard — branch-naming structure, Conventional Commits format, merge rules — is documented in [Git Workflow](../development/git-workflow.md). |
| Project methodology / roadmap | [Methodology](methodology.md) covers the sprint skeleton, planning rules, and roadmap; [Sprints](../sprints/README.md) records the per-sprint plans and handovers. |
| Security / OAuth / password hashing | Sprint 2 migrated authentication to **Supabase Auth** — the custom JWT + bcrypt implementation was fully removed, so our code never touches password hashes. Rationale in [Technical Decisions](../development/technical-decisions.md). |
| Why React / Node / Supabase / MapBox-vs-Leaflet | Personal, team-specific reasons for each choice — plus a Supabase-vs-competition comparison and the MapBox-vs-Leaflet evaluation — are documented in [Technical Decisions](../development/technical-decisions.md). |
| Team meeting structure | All team meetings now follow one fixed record format ([Meeting Records](../meetings/index.md)). |
| Stakeholder minutes + selfie, kept separate | Stakeholder sessions are recorded on **this page** only — separate from team meetings — with minutes and a photo at every future session. |

---

## Recording protocol for future sessions

1. **Before** — confirm the session's purpose and what will be demoed.
2. **During** — take minutes of every point raised, and a photo/selfie with the stakeholder.
3. **After** — add the record here (date, type, feedback, response mapping) and triage the action items into the sprint plan.

_New reviews are added above, most recent first._
