# Wits Quest Documentation

**Wits Quest** (COMS3011A, Project 6) is a location-gated progressive web application (PWA) that turns the University of the Witwatersrand campus into a *Pokémon GO*–style exploration and collectible card battle game.

Players physically travel to real campus landmarks, answer trivia about Wits history, alumni, and academic life, and are rewarded with collectible cards. Those cards are then used in turn-based (and eventually live) battles against the CPU or other students, layered with progression systems (XP, levels, streaks), a card economy (Essence currency, upgrading, trading), and competitive ranked play.

> AI Declaration: the original project brief was generated with Claude Code (Claude Opus 5), supplied by the course proposer.

## What's in this documentation

| Section | Contents |
| :--- | :--- |
| **[Project](project/overview.md)** | Game concept, functional requirements (Basic / Intermediate / Advanced tiers), and project scope |
| **[UML Diagrams](uml/index.md)** | Use case, class, sequence, and activity diagrams |
| **[Database](database/database-plan.md)** | Entity relationship design and full table schema |
| **[Meetings](meetings/index.md)** | Team meeting records and decisions log |
| **[Development](development/architecture.md)** | System architecture, git workflow, and technical decisions |

## Quick facts

- **Course**: COMS3011A — University of the Witwatersrand
- **Team size**: 6 members, each owning a domain (geolocation, battle engine, database/auth, admin console, progression/economy, anti-cheat/matchmaking)
- **Stack shape**: `frontend/` + `backend/` monorepo (see `package.json` root scripts: `dev:frontend`, `dev:backend`, `install:all`)
