# Wits Quest Documentation

**Wits Quest** is a campus game for the University of the Witwatersrand. Players walk to real places on campus, answer a trivia question about each place, and win a collectible card. They then use their cards in turn-based battles against the computer or other players.

> **Course:** COMS3011A Software Development Project
> **Team:** Big-O (6 members)
> **Live app:** [wits-quest.vercel.app](https://wits-quest.vercel.app)
> **API docs (Swagger):** [wits-quest.onrender.com/api/docs](https://wits-quest.onrender.com/api/docs)
> **Latest test results:** [946 tests passing, 0 failed API requests under load](development/test-report.md) ([PDF](reports/performance-and-coverage-report.pdf))

---

## Where to start

| If you want to know… | Read |
| :--- | :--- |
| What the game does | [Core Features](project/core-features.md), [Features by Sprint](project/sprint-features.md), [Requirements](project/requirements.md) |
| What it's built with, and why | [Tech Stack](project/tech-stack.md) |
| How the API works | [API Architecture](development/api-architecture.md), [Quick Start](development/api-quickstart.md), [Endpoint Catalogue](development/api-endpoints.md), [Swagger UI](development/swagger.md) |
| How the team works | [Project Methodology](project/methodology.md), [Git Methodology](development/git-workflow.md), [Sprints](sprints/README.md), [Meetings](meetings/index.md) |
| How it was planned and designed | [Development Plan](planning/development-plan.md), [Roadmap](planning/roadmap.md), [System Design](planning/system-design.md), [UI Design](planning/ui-design.md) |
| What tools we use | [Project Tracker](tools/project-tracker.md), [Bug Tracker](development/bug-tracking.md), [Code Quality](tools/code-quality.md) |
| What users and the tutor said, and what we changed | [User Feedback](project/user-feedback.md), [Improvement](project/improvement.md), [Stakeholder Reviews](project/stakeholder-reviews.md) |
| How easy it is to use | [User Experience](ux/user-experience.md), [Responsiveness](ux/responsiveness.md), [Structure](ux/structure.md), [Accessibility](ux/accessibility.md) |
| How it is tested, and how fast it is | **[Test Results at a Glance](development/test-report.md)**, [Testing Documentation](development/testing-documentation.md), [Performance](development/performance.md) |
| How it is hosted, and what data is live | [Deployment](development/deployment.md), [Production Data](database/production-data.md) |
| How it is built | [Database Schema](database/database-schema.md), [System Architecture](uml/01_system_architecture.md), [Third-Party Code](development/third-party.md) |


---

## Quick facts

| | |
| :--- | :--- |
| **Frontend** | React 18 + TypeScript, built with Vite, hosted on Vercel |
| **Backend** | Node.js + Express REST API and Socket.IO for live battles, hosted on Render |
| **Database and login** | Supabase (PostgreSQL, Supabase Auth, file storage) |
| **External API** | OpenRouteService for walking directions to the next event, with the FOSSGIS router as a backup |
| **Testing** | Vitest on both frontend and backend, with React Testing Library and Supertest |
| **Code quality** | ESLint, Prettier and husky git hooks |
| **Team** | 6 members, each owning one area of the game |

---

## Other repositories

The application code lives on the university Gitea server (student login needed):

| Repository | What it holds |
| :--- | :--- |
| [Wits-Quest](https://sdp.ms.wits.ac.za/big-o/Wits-Quest) | Main source code (frontend and backend) |
| [Wits-Quest-Documentation](https://sdp.ms.wits.ac.za/big-o/Wits-Quest-Documentation) | This documentation site (mirrored on [GitHub](https://github.com/NkadimengKgothatso/-wits-quest)) |
