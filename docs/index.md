# Welcome to Wits Quest Documentation

**Wits Quest** is a location-gated campus adventure game that turns the University of the Witwatersrand into an interactive learning arena. Think *Pokémon GO* meets *Top Trumps* — students physically travel to real campus landmarks, answer trivia about Wits history and alumni, collect cards, and battle each other or AI opponents.

> **Course:** COMS3011A — Software Development Project
> **Team:** Big-O (6 members)
> **Live App:** [wits-quest.vercel.app](https://wits-quest.vercel.app)
> **Live Docs:** [nkadimengkgothatso.github.io/-wits-quest](https://nkadimengkgothatso.github.io/-wits-quest/)

---

## Explore the Documentation

### Understanding the Project

| Section | What You'll Find |
| :--- | :--- |
| [**Project Overview**](project/overview.md) | The game concept, core systems, delivery tiers, and team ownership |
| [**Requirements**](project/requirements.md) | Functional requirements across Basic, Intermediate, and Advanced tiers |
| [**Scope**](project/scope.md) | What's in scope, what's out, and the project boundaries |

### System Design

| Section | What You'll Find |
| :--- | :--- |
| [**Architecture & Design**](uml/01_system_architecture.md) | System architecture, class diagrams, use cases, and database ERD |
| [**Behaviour & Flow**](uml/02_battle_state_machine.md) | Battle state machine, sequence diagrams, and activity flows |
| [**Database**](database/database-plan.md) | Entity relationship design and full PostgreSQL table schema |

### Building the Project

| Section | What You'll Find |
| :--- | :--- |
| [**Development**](development/architecture.md) | System architecture, Git workflow, and the CPU battle rulebook |
| [**Decisions Log**](development/decisions-log.md) | Why we chose Issues over Projects, a separate docs repo, and the repo split |
| [**Technical Decisions**](development/technical-decisions.md) | Technology choices and their rationale (Leaflet, Vitest, Supabase, etc.) |

### Tracking Progress

| Section | What You'll Find |
| :--- | :--- |
| [**Sprints**](sprints/README.md) | Sprint 1 & 2 specifications, implementation guides, and handover docs |
| [**Stakeholder Reviews**](project/stakeholder-reviews.md) | Tutor feedback from formal review sessions and how the team responded |
| [**Meetings**](meetings/index.md) | Team meeting records, decisions, and action items |
| [**User Feedback**](project/user-feedback.md) | The player feedback form and how responses shape the backlog |

---

## Quick Facts

| | |
| :--- | :--- |
| **Stack** | Vite + React 18 + TypeScript (frontend), Node.js 20 + Express (backend), Supabase (PostgreSQL + Auth + Storage + Realtime) |
| **Auth** | Supabase Auth — email OTP sign-up, browser client with anon key, backend verifies tokens server-side |
| **Deployment** | Vercel (frontend), Render (backend), GitHub Pages (this site) |
| **Testing** | Vitest with an 80%+ coverage gate on both frontend and backend — 132 frontend tests and 54 backend tests passing |
| **CI/CD** | Gitea Actions on the university instance (migrated from GitHub Actions in Sprint 2) |
| **Team Size** | 6 members, each owning a domain end-to-end |

---

## Additional Resources

These documents live in the [source repository](https://sdp.ms.wits.ac.za/big-o/Wits-Quest) on the university Gitea instance (student login required) alongside this MkDocs site:

| Resource | Description |
| :--- | :--- |
| [Battle AI Docs](https://sdp.ms.wits.ac.za/big-o/Wits-Quest/src/branch/main/battle_AI_docs) | CPU battle engine implementation plans and walkthroughs |
| [Feature Implementation Plans](https://sdp.ms.wits.ac.za/big-o/Wits-Quest/src/branch/main/ai) | Feature-level plans: Live PvP, Async PvP, anti-cheat, map challenges, design system |
| [Migration Plans](https://sdp.ms.wits.ac.za/big-o/Wits-Quest/src/branch/main/personal) | Supabase Auth migration plan and other Sprint 2 infrastructure moves |
| [Master Guides](https://sdp.ms.wits.ac.za/big-o/Wits-Quest/src/branch/main) | Master guide, feature handover, gap analysis, and fixes tracker |
