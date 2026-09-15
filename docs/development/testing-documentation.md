# Testing Documentation

How Wits Quest is tested end to end, organised around the three pillars of the Testing Documentation criterion: the **user feedback formal process**, the **automated testing procedure**, and the **policy around tests**.

---

## At a glance

| Pillar | What it is | Where it lives |
| :--- | :--- | :--- |
| **User feedback** | A formal instrument → collection → analysis → triage loop with real players | [User Feedback](../project/user-feedback.md), [Stakeholder Reviews](../project/stakeholder-reviews.md) |
| **Automated testing** | Vitest suites with coverage gates, enforced on every commit and every push by CI | [Test Results & Coverage](testing.md), [Testing & CI/CD Plan](testing-plan.md) |
| **Test policy** | The standing rules every change must satisfy — Definition of Done, coverage gates, severity blocking | [Methodology — Definition of Done](../project/methodology.md#definition-of-done), [Bug Tracking](bug-tracking.md) |

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
| CI on every push | `tsc --noEmit`, ESLint, and the full Vitest suite with **80% coverage gates** for both packages | The CI pipeline ([Testing & CI/CD Plan](testing-plan.md)) |
| Deploy gate | Only `main` deploys, and only builds that passed the full gate | Vercel / Render / GitHub Pages ([Deployment](deployment.md)) |

Local procedure: run `npm test` (or the coverage variant) per package; tests live next to the code they cover. The tooling — Vitest, Testing Library, husky — is catalogued in [Third-Party Code & Services](third-party.md), and the current results and coverage live in [Test Results & Coverage](testing.md).

## 3. Policy around tests

The standing rules, sourced from [Methodology](../project/methodology.md#definition-of-done) and [Bug Tracking](bug-tracking.md):

1. **No task is done without tests** — every software task carries unit or integration tests, written with the feature (DoD clause 2).
2. **Coverage gates are hard** — both packages must meet the 80% Vitest coverage gate in CI; a red suite or failing typecheck blocks the merge (DoD clause 5).
3. **API changes are verified live** — every state-changing endpoint is checked authenticated and server-validated (DoD clause 3).
4. **Two-way traceability** — every PR cites its task and fix-register IDs, so any fix can be traced to its evidence and vice versa (DoD clause 7).
5. **Blocking rule** — zero open high-severity bugs at any milestone gate; gameplay fixes must be verified on a real phone on campus.
6. **Honest reporting** — results are published as-is, including gaps: Sprint 1 shipped with no automated checks and that was recorded openly rather than hidden ([Stakeholder Reviews](../project/stakeholder-reviews.md)).

!!! tip "For the presentation"
    This page is the map; the linked pages are the evidence. Walk the criterion pillar by pillar — the form and its response charts, the CI workflow and coverage table, then the six policy clauses above.
