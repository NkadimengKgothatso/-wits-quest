# Wits Quest Documentation

**Wits Quest** (COMS3011A) is a location-gated progressive web application that turns the University of the Witwatersrand campus into a *Pokémon GO*–style exploration and collectible card battle game.

Players physically travel to real campus landmarks, answer trivia about Wits history, alumni, and academic life, and are rewarded with collectible cards. Those cards are then used in turn-based battles against the CPU or other students, layered with progression systems (XP, levels, streaks), a card economy (Essence currency, upgrading, trading), and competitive ranked play.

> **AI Declaration:** The original project brief was generated with Claude Code (Claude Opus 5), supplied by the course proposer.

---

## What's in this Documentation

| Section | Contents |
| :--- | :--- |
| **[Project](project/overview.md)** | Game concept, functional requirements (Basic / Intermediate / Advanced tiers), and project scope |
| **[Architecture & Design](uml/01_system_architecture.md)** | System architecture, class diagrams, use cases, and ERD |
| **[Behaviour & Flow](uml/02_battle_state_machine.md)** | Battle state machine, sequence diagrams, and activity diagrams |
| **[Database](database/database-plan.md)** | Entity relationship design and full table schema |
| **[Development](development/architecture.md)** | System architecture, decisions log, technical decisions, and git workflow |
| **[Meetings](meetings/index.md)** | Team meeting records and decisions log |
| **[Sprints](sprints/README.md)** | Sprint 1 & 2 specifications, implementation guides, and handover docs |

---

## Quick Facts

- **Course**: COMS3011A — University of the Witwatersrand
- **Team**: Big-O (6 members)
- **Stack**: Vite + React 18 + TypeScript frontend, Node.js + Express backend, Supabase PostgreSQL database
- **Deployment**: Vercel (frontend), Render (backend)
- **Live Docs**: [https://nkadimengkgothatso.github.io/-wits-quest/](https://nkadimengkgothatso.github.io/-wits-quest/)

---

## Additional Documentation

Beyond this MkDocs site, the full documentation repository also includes:

| Section | Description |
| :--- | :--- |
| **[Battle AI](https://sdp.ms.wits.ac.za/big-o/Documantation/src/branch/Kgothatso/documatation_migration/battle-ai)** | CPU battle engine implementation plans and walkthroughs |
| **[Implementation Plans](https://sdp.ms.wits.ac.za/big-o/Documantation/src/branch/Kgothatso/documatation_migration/implementation-plans)** | Feature-level implementation plans (PvP, anti-cheat, migrations, etc.) |
| **[Deployment](https://sdp.ms.wits.ac.za/big-o/Documantation/src/branch/Kgothatso/documatation_migration/deployment)** | Platform deployment guides |
| **[Master Guides](https://sdp.ms.wits.ac.za/big-o/Documantation/src/branch/Kgothatso/documatation_migration/)** | Master guide, feature handover, gap analysis, and fixes tracker |
