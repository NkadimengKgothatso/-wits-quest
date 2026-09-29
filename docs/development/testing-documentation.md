# Testing Documentation

How Wits Quest is tested end to end, organised around the three pillars of the Testing Documentation criterion: the **user feedback formal process**, the **automated testing procedure**, and the **policy around tests**.

---

## At a glance

| Pillar | What it is | Where it lives |
| :--- | :--- | :--- |
| **User feedback** | A formal instrument → collection → analysis → triage loop with real players | [User Feedback](../project/user-feedback.md), [Stakeholder Reviews](../project/stakeholder-reviews.md) |
| **Automated testing** | Vitest suites with coverage gates, enforced on every commit and every push by CI | [Test Results & Coverage](testing.md), [Testing & CI/CD Plan](testing-plan.md) |
| **Test policy** | The standing rules every change must satisfy — Definition of Done, coverage gates, severity blocking | [Methodology — Definition of Done](../project/methodology.md#definition-of-done), [Bug Tracking](bug-tracking.md) |

**Sprint 3 snapshot (2026-09-29):**

| Code base | Tests | Statements | Branches | Functions | Lines | 60% gate | 80% final gate |
| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |
| Frontend (Vitest + React Testing Library) | 163 tests, 20 files, all passing | 89.21% | 83.03% | 83.33% | 89.21% | ✅ | ✅ |
| Backend (Vitest + Supertest) | 452 tests, 29 files, all passing | 63.91% | 78.74% | 70.90% | 63.91% | ✅ | ❌ not yet |

Full breakdown, per-file gaps and the plan to reach 80% on the backend are in [Testing & CI/CD Plan](testing-plan.md#6-sprint-3-status).

**Performance and accessibility (PageSpeed Insights, Desktop, 2026-09-29):** Performance 99, Accessibility 97, Best Practices 100, SEO 90, with FCP 0.7 s, LCP 0.9 s, TBT 0 ms and CLS 0. One accessibility issue (no `main` landmark) is logged for fixing. Details in [Testing & CI/CD Plan](testing-plan.md#7-performance-and-accessibility-testing).

![Frontend test run and V8 coverage report, 2026-09-29](images/2026-09-29-frontend-coverage.jpeg)

---

## 1. User feedback — the formal process

Testing with real players follows a fixed, repeatable process rather than ad-hoc opinions:

1. **Instrument** — a structured 21-question Google Form (scaled ratings, multiple choice, free text) organised along the player's journey: [Feedback Form & Responses](../project/user-feedback.md).
2. **Distribution** — real students played during the Sprint 2 testing window, on campus, at the actual landmarks.
3. **Collection & analysis** — responses are summarised with per-question charts and verbatim quotes; every signal is mapped to an action.
4. **Triage** — feedback enters the same pipeline as code defects: reported bugs become register entries ([Bug Tracking](bug-tracking.md)), while tuning and feature requests land in the Sprint 3 backlog.
5. **Closure** — stakeholder reviews verify the outcomes ([Stakeholder Reviews](../project/stakeholder-reviews.md)), and gameplay-facing fixes are re-checked on real devices.

## 2. Automated testing — the procedure

The mechanical layer runs without human intervention:

| Stage | What runs | Where |
| :--- | :--- | :--- |
| Pre-commit | ESLint + Prettier via husky `lint-staged` — badly formatted code cannot be committed at all | Every developer's machine |
| CI on every push | `tsc --noEmit`, ESLint, and the full Vitest suite for **both code bases**, failing the build under the **60% coverage gate** (rising to **80%** for the final submission) | The CI pipeline ([Testing & CI/CD Plan](testing-plan.md)) |
| Deploy gate | Only `main` deploys, and only builds that passed the full gate | Vercel / Render / GitHub Pages ([Deployment](deployment.md)) |
| Performance and accessibility audit | PageSpeed Insights (Lighthouse) on the production URL: performance, accessibility, best practices, SEO | Run against the live Vercel deployment ([results](testing-plan.md#7-performance-and-accessibility-testing)) |

**Test layers**

| Layer | Tooling | Scope |
| :--- | :--- | :--- |
| Backend API tests | Vitest + Supertest | Every endpoint: auth, validation, status codes, error handling |
| Frontend UI tests | Vitest + React Testing Library (jsdom) | Screens, components, contexts, and user flows |
| Unit tests | Vitest | Game logic (battle engine, AI, Elo), anti-cheat, services, offline queue |

Local procedure: run `npm test` (which runs `vitest run --coverage`) per package; tests live next to the code they cover. The tooling — Vitest, Testing Library, Supertest, husky — is catalogued in [Third-Party Code & Services](third-party.md), and the current results and coverage live in [Test Results & Coverage](testing.md).

## 3. Policy around tests

The standing rules, sourced from [Methodology](../project/methodology.md#definition-of-done) and [Bug Tracking](bug-tracking.md):

1. **No task is done without tests** — every software task carries unit or integration tests, written with the feature (DoD clause 2).
2. **Every new feature ships with both test types** — API tests (Supertest) for backend changes and UI tests (React Testing Library) for frontend changes, in the same PR as the feature.
3. **Coverage gates are hard and staged** — CI reports coverage for both code bases and **fails under 60%** (the rubric's advanced band), **rising to 80% for the final submission**. A red suite, a failing typecheck or a coverage drop below the current gate blocks the merge (DoD clause 5).
4. **API changes are verified live** — every state-changing endpoint is checked authenticated and server-validated (DoD clause 3).
5. **Two-way traceability** — every PR cites its task and fix-register IDs, so any fix can be traced to its evidence and vice versa (DoD clause 7).
6. **Blocking rule** — zero open high-severity bugs at any milestone gate; gameplay fixes must be verified on a real phone on campus.
7. **Honest reporting** — results are published as-is, including gaps: Sprint 1 shipped with no automated checks and that was recorded openly rather than hidden ([Stakeholder Reviews](../project/stakeholder-reviews.md)); the current per-file coverage gaps, including the backend still being below the final 80% gate, are listed in [Testing & CI/CD Plan](testing-plan.md#6-sprint-3-status).

!!! tip "For the presentation"
    This page is the map; the linked pages are the evidence. Walk the criterion pillar by pillar — the form and its response charts, the CI workflow and coverage table, then the seven policy clauses above.
