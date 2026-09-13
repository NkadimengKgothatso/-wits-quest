# Wits Quest — Documentation

<div align="center">

![Documentation](https://img.shields.io/badge/Documentation-Wits%20Quest-blue?style=flat&logo=materialformkdocs)
![License](https://img.shields.io/badge/License-Academic-blue?style=flat)
![Team](https://img.shields.io/badge/Team-Big--O-orange?style=flat)
![Course](https://img.shields.io/badge/Course-COMS3011A-green?style=flat)

**Centralised documentation for the Wits Quest project — a location-aware, turn-based campus adventure game.**

[Gitea Repository](https://sdp.ms.wits.ac.za/big-o/Wits-Quest) • [Live Application](https://wits-quest.vercel.app) • [Gitea Docs](https://sdp.ms.wits.ac.za/pages/big-o/Wits-Quest/)

</div>

---

## About This Repository

This repository contains all documentation, architectural plans, sprint guides, and technical specifications for **Wits Quest**, developed by Team Big-O for the University of the Witwatersrand Software Development Project (COMS3011A).

Wits Quest is a location-gated progressive web application that turns the Wits University campus into a Pokémon GO–style exploration and collectible card battle game. Students physically travel to real campus landmarks, answer trivia about Wits history, collect cards, and battle each other or AI opponents.

---

## Documentation Structure

| Directory | Description |
| :--- | :--- |
| **[docs/](./docs/)** | Core MkDocs documentation — project overview, requirements, scope, UML diagrams, database design, meeting records, and development guides. |
| **[battle-ai/](./battle-ai/)** | Battle system AI documentation — implementation plans and walkthroughs for the CPU battle engine, balance system, battle hub, and best-of-5 mechanics. |
| **[deployment/](./deployment/)** | Deployment guides — Render platform deployment configuration and instructions. |
| **[sprints/](./sprints/)** | Sprint planning and handover — Sprint 1 & 2 specifications, feature selection guides, and handover documentation. |
| **[implementation-plans/](./implementation-plans/)** | Feature implementation plans — PvP (async & live), anti-cheat, profile refactoring, Supabase migration, CI/CD strategy, design system, and more. |

---

## Quick Navigation

### Project Documentation (MkDocs)

| Document | Description |
| :--- | :--- |
| [Project Overview](./docs/project/overview.md) | Game concept, key pillars, and high-level description |
| [Requirements](./docs/project/requirements.md) | Functional requirements across Basic, Intermediate, and Advanced tiers |
| [Scope](./docs/project/scope.md) | Project boundaries, in-scope and out-of-scope features |
| [UML Diagrams](./docs/uml/index.md) | System architecture, state machines, use cases, ERDs, activity & sequence diagrams |
| [Database Plan](./docs/database/database-plan.md) | Entity relationship design and database architecture |
| [Database Schema](./docs/database/database-schema.md) | Full table schema with column descriptions and constraints |
| [Architecture](./docs/development/architecture.md) | System architecture and component overview |
| [Git Workflow](./docs/development/git-workflow.md) | Branching strategy and contribution workflow |
| [Technical Decisions](./docs/development/technical-decisions.md) | Key technology choices and their rationale |
| [Meeting Records](./docs/meetings/index.md) | Team meeting minutes and decision logs |

### Sprint Documentation

| Document | Description |
| :--- | :--- |
| [Sprint 1 Specification](./sprints/SPRINT1.md) | Sprint 1 requirements and deliverables |
| [Sprint 1 Implementation Guide](./sprints/WITS_QUEST_SPRINT1_GUIDE.md) | Step-by-step Sprint 1 implementation |
| [Sprint 2 Feature Selection](./sprints/SPRINT2_FEATURE_SELECTION_AND_TASK_GUIDE.md) | Sprint 2 feature prioritisation and task breakdown |
| [Sprint 2 Handover Guide](./sprints/WITS_QUEST_SPRINT2_HANDOVER_GUIDE.md) | Sprint 2 handover documentation |

### Master Guides

| Document | Description |
| :--- | :--- |
| [Master Guide V2](./WITS_QUEST_MASTER_GUIDE_V2.md) | Comprehensive project master guide |
| [Feature Handover Guide](./WITS_QUEST_FEATURE_HANDOVER_GUIDE.md) | Feature-level handover documentation |
| [Features Status & Gap Analysis](./FEATURES_STATUS_AND_GAP_ANALYSIS.md) | Current feature status and remaining gaps |
| [Database Plan (Detailed)](./WITS_QUEST_DATABASE_PLAN.md) | In-depth database architecture plan |
| [Fixes & Outstanding Features](./WITS_QUEST_FIXES_AND_OUTSTANDING_FEATURES.md) | Known issues and features yet to be implemented |

### Battle AI Documentation

| Document | Description |
| :--- | :--- |
| [Battle AI Overview](./battle-ai/README.md) | Battle system documentation index |
| [CPU Battle Rules V2 — Plan](./battle-ai/cpu-battle-rules-v2-implementation-plan.md) | CPU battle rules implementation plan |
| [CPU Battle Rules V2 — Walkthrough](./battle-ai/cpu-battle-rules-v2-walkthrough.md) | CPU battle rules code walkthrough |
| [Battle Hub — Plan](./battle-ai/battle-hub-implementation-plan.md) | Battle hub feature implementation plan |
| [Battle Hub — Walkthrough](./battle-ai/battle-hub-walkthrough.md) | Battle hub code walkthrough |
| [Battle Balance — Plan](./battle-ai/battle-balance-implementation-plan.md) | Battle balance system implementation plan |
| [Battle Balance — Walkthrough](./battle-ai/battle-balance-walkthrough.md) | Battle balance code walkthrough |
| [Best-of-5 Fix — Walkthrough](./battle-ai/best-of-5-fix-walkthrough.md) | Best-of-5 battle fix walkthrough |

### Implementation Plans

| Document | Description |
| :--- | :--- |
| [PvP Feature Plan](./implementation-plans/pvp-feature-implementation-plan.md) | Real-time PvP feature architecture |
| [Live PvP Walkthrough](./implementation-plans/live-pvp-walkthrough.md) | Live PvP implementation walkthrough |
| [Async PvP Walkthrough](./implementation-plans/async-pvp-walkthrough.md) | Asynchronous PvP implementation walkthrough |
| [Anti-Cheat Plan](./implementation-plans/implementation_plan_anticheat.md) | Anti-cheat system implementation plan |
| [Battle Engine Plan](./implementation-plans/TASK_2_BATTLE_ENGINE_PLAN.md) | Battle engine core implementation |
| [Supabase Migration Guide](./implementation-plans/supabase_migration_guide.md) | Database migration to Supabase |
| [CI/CD & Testing Plan](./implementation-plans/testing_and_ci_cd_plan.md) | Testing strategy and CI/CD pipeline |
| [Vercel Deployment](./implementation-plans/vercel_deployment.md) | Frontend deployment to Vercel |
| [Profile Refactor Plan](./implementation-plans/profile_refactor_plan.md) | Player profile system refactoring |
| [Remaining Tasks Plan](./implementation-plans/remaining-tasks-implementation-plan.md) | Outstanding tasks implementation |
| [Repo Separation Plan](./implementation-plans/repo-separation-implementation-plan.md) | Repository separation strategy |
| [Gitea Actions Migration](./implementation-plans/gitea-actions-migration-plan.md) | Migrating CI/CD to Gitea Actions |
| [UI Design System](./implementation-plans/UI_DESIGN_SYSTEM.md) | UI design system and tokens |
| [Design Tokens](./implementation-plans/wits-quest-design-tokens.md) | Wits Quest visual design token reference |

### Deployment

| Document | Description |
| :--- | :--- |
| [Render Deployment](./deployment/RENDER_DEPLOYMENT.md) | Backend deployment guide for Render platform |

---

## Serving Documentation Locally

This repository is configured for **MkDocs** with the **Material** theme. To serve the documentation locally:

```bash
# Install MkDocs and Material theme
pip install mkdocs-material

# Serve with live reload
mkdocs serve

# Build static files for deployment
mkdocs build
```

Then visit **http://localhost:8000** in your browser.

---

## Repository Links

| Resource | URL |
| :--- | :--- |
| **Source Code (Gitea)** | https://sdp.ms.wits.ac.za/big-o/Wits-Quest |
| **Documentation (Gitea)** | https://sdp.ms.wits.ac.za/big-o/Documantation |
| **Live Application** | https://wits-quest.vercel.app |
| **GitHub Mirror** | https://github.com/mahlatseclayton/wits_quest |

---

<div align="center">
  <sub>Developed for the Wits University Software Development Project by Team Big-O.</sub>
</div>
