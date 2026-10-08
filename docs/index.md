# Wits Quest Documentation

**Wits Quest** is a campus game for the University of the Witwatersrand. Players walk to real places on campus, answer a trivia question about each place, and win a collectible card. They then use their cards in turn-based battles against the computer or other players.

> **Course:** COMS3011A Software Development Project
> **Team:** Big-O (6 members)
> **Live app:** [wits-quest.vercel.app](https://wits-quest.vercel.app)
> **API docs (Swagger):** [wits-quest.onrender.com/api/docs](https://wits-quest.onrender.com/api/docs)

---

## Where to start

| If you want to know… | Read |
| :--- | :--- |
| What the game is and what it does | [Game Overview](project/overview.md), [Requirements](project/requirements.md) |
| How to call the API | [API Quick Start](development/api-quickstart.md), [Endpoint Catalogue](development/api-endpoints.md) |
| How it is built | [System Architecture](uml/01_system_architecture.md), [Database Schema](database/database-schema.md) |
| How it is tested | [Test Results & Coverage](development/testing.md), [Testing Documentation](development/testing-documentation.md) |
| How it is hosted | [Deployment](development/deployment.md) |
| How the team works | [Methodology](project/methodology.md), [Git Workflow](development/git-workflow.md), [Meetings](meetings/index.md) |
| What users and the tutor said | [User Feedback](project/user-feedback.md), [Stakeholder Reviews](project/stakeholder-reviews.md) |

---

## Quick facts

| | |
| :--- | :--- |
| **Frontend** | React 18 + TypeScript, built with Vite, hosted on Vercel |
| **Backend** | Node.js + Express REST API and Socket.IO for live battles, hosted on Render |
| **Database and login** | Supabase (PostgreSQL, Supabase Auth, file storage) |
| **External API** | OpenRouteService for walking directions to the next event |
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
