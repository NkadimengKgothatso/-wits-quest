# Performance

How Wits Quest is measured, monitored and kept free of performance issues —
covering the rubric's performance criteria: **no performance issues** (Sprint 3)
and, at submission, API load handling and application load time / responsiveness.

## What we measure

| Area | Metric | Tool | Target |
| --- | --- | --- | --- |
| App | First contentful paint / full load | Lighthouse (Chrome DevTools) | FCP < 1.8 s, Lighthouse ≥ 90 on Performance |
| App | Runtime responsiveness | Chrome DevTools Performance tab | No dropped/long tasks over 200 ms during a battle |
| App | Bundle size | `vite build` output report | Initial JS bundle kept small via route-level code splitting |
| API | First-request latency | `curl -w` timing against the deployed API | Cold start + first request < 2 s |
| API | Load handling | Supertest suites under CI (functional); load spot-checks with `autocannon` | No errors at 50 concurrent requests on the REST endpoints |
| API | Uptime / crashes | Deployment platform logs (see [Deployment](deployment.md)) | No crashes during a standard play session |
| Tests | Suite wall time | Vitest run summary | Full CI pipeline (both packages + gates) < 10 min |

## Design decisions that protect performance

- **Server-authoritative state.** Battle state, ELO and anti-cheat validation live in
  the backend, so the client never re-simulates a full battle — payloads over the
  socket are small diffs, not full state dumps.
- **Offline queue.** Actions taken offline are queued client-side and replayed when
  connectivity returns ([services tests](testing.md)), so poor network degrades
  gracefully instead of blocking the UI.
- **Pooled/lazy data access.** Leaderboards and card collections page their queries
  against Supabase rather than fetching whole tables.
- **Excluded-but-verified heavy screens.** The socket-heavy PvP arenas are kept out
  of jsdom coverage by design and verified against the real backend
  ([testing documentation](testing-documentation.md)) — unit-testing them would
  measure the mocks, not performance.

## Results log

Recorded per sprint; update this table when a new measurement is taken.

| Date | Area | Result | Notes |
| --- | --- | --- | --- |
| 2026-09 | Tests | Frontend 132/132 passing; both packages clear the 80% coverage gate | [Testing](testing.md) |
| 2026-09 | CI | Pipeline runs both suites + gates on free cloud runners | [Testing & CI/CD plan](testing-plan.md) |

## How to reproduce the measurements

```bash
# app bundle + build time
cd frontend && npm run build

# full test + coverage gates (both packages)
cd frontend && npm run test
cd backend  && npm run test

# API first-request timing (adjust URL to the deployment in deployment.md)
curl -o /dev/null -s -w "dns:%{time_namelookup} connect:%{time_connect} ttfb:%{time_starttransfer} total:%{time_total}\n" https://<deployed-api>/api/health
```
