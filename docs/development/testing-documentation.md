# Testing Documentation

How testing works on this project: how we collect feedback from real users, how the automated tests run, and the rules every change must follow.

| Part | Where the details are |
| :--- | :--- |
| Feedback from real players | [User Feedback](../project/user-feedback.md) |
| Feedback from the tutor | [Stakeholder Reviews](../project/stakeholder-reviews.md) |
| Automated test results and coverage | [Test Results & Coverage](testing.md) |
| Speed and accessibility checks | [Performance](performance.md) |

---

## 1. User feedback process

1. **Form:** a 21-question Google Form with ratings, multiple choice and free text, following the player's journey through the game.
2. **Play-testing:** real students played the game on campus, at the actual locations.
3. **Analysis:** we chart each question's answers and pick out quotes, and every point gets an action.
4. **Follow-up:** bugs become Gitea issues ([Bug Tracking](bug-tracking.md)), and ideas go into the next sprint's plan.
5. **Check:** fixes to game features are re-tested on real phones, and the tutor sees the results at the next review.

## 2. Automated testing procedure

| Step | What runs | When |
| :--- | :--- | :--- |
| Commit | ESLint and Prettier on the changed files | Every commit (husky pre-commit hook) |
| Push | Lint, type-check, and all frontend and backend tests with coverage | Every push (husky pre-push hook) |
| Gitea CI | The same checks on the university's runners | Run by hand when needed |
| Deploy | Only `main` is deployed | Every push to `main` |

**Kinds of tests**

| Kind | Tool | What it checks |
| :--- | :--- | :--- |
| API tests | Vitest + Supertest | Every backend endpoint: login, permissions, input checks, status codes, errors |
| UI tests | Vitest + React Testing Library | Screens, components and user actions |
| Unit tests | Vitest | Game rules (battles, Elo, streaks), anti-cheat, location checks, offline queue |

To run them: `npm test` inside `frontend/` or `backend/`. Each test file sits next to the code it tests.

## 3. Rules for tests

1. **No task is done without tests.** New features come with tests in the same pull request: API tests for backend changes, UI tests for frontend changes.
2. **Coverage can't drop below the gate.** The frontend gate is 80% and the backend gate is 60% (target 80%). Below that, the test run fails and the push is blocked.
3. **All tests must pass** before a push or a merge.
4. **Changes that alter data are checked on the server,** with the login and input checks tested.
5. **No high-severity bugs open** at a milestone, and game fixes are re-tested on a real phone on campus.
6. **We report results honestly,** including gaps. Sprint 1 had no automated tests, and we recorded that. What we still don't test automatically is listed on [Test Results & Coverage](testing.md#what-we-dont-test-automatically).
