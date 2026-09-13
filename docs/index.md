# Welcome to Wits Quest Documentation

**Wits Quest** is a location-gated campus adventure game that turns the University of the Witwatersrand into an interactive learning arena. Think *Pokémon GO* meets *Top Trumps* — students physically travel to real campus landmarks, answer trivia about Wits history and alumni, collect cards, and battle each other or AI opponents.

> **Course:** COMS3011A — Software Development Project
> **Team:** Big-O (6 members)
> **Live App:** [wits-quest.vercel.app](https://wits-quest.vercel.app)
> **Live Docs:** [nkadimengkgothatso.github.io/-wits-quest](https://nkadimengkgothatso.github.io/-wits-quest/)

---

## Explore the Documentation

Use the sidebar to navigate, or jump to a section below:

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
| [**Meetings**](meetings/index.md) | Team meeting records, decisions, and action items |

---

## Quick Facts

| | |
| :--- | :--- |
| **Stack** | Vite + React 18 + TypeScript (frontend), Node.js + Express (backend), Supabase PostgreSQL |
| **Deployment** | Vercel (frontend), Render (backend) |
| **Testing** | Vitest with 80%+ coverage gate on both frontend and backend |
| **CI/CD** | Gitea Actions (migrated from GitHub Actions) |
| **Team Size** | 6 members, each owning a domain end-to-end |

---

## Additional Resources

These documents live in the [Gitea repository](https://sdp.ms.wits.ac.za/big-o/Documantation) alongside this MkDocs site:

| Resource | Description |
| :--- | :--- |
| [Battle AI Docs](https://sdp.ms.wits.ac.za/big-o/Documantation/src/branch/Kgothatso/documatation_migration/battle-ai) | CPU battle engine implementation plans and walkthroughs |
| [Implementation Plans](https://sdp.ms.wits.ac.za/big-o/Documantation/src/branch/Kgothatso/documatation_migration/implementation-plans) | Feature-level plans: PvP, anti-cheat, migrations, design system |
| [Deployment Guides](https://sdp.ms.wits.ac.za/big-o/Documantation/src/branch/Kgothatso/documatation_migration/deployment) | Platform deployment configuration |
| [Master Guides](https://sdp.ms.wits.ac.za/big-o/Documantation/src/branch/Kgothatso/documatation_migration/) | Master guide, feature handover, gap analysis, and fixes tracker |
