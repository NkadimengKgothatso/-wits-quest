# Roadmap

The project from start to submission, with each milestone and what was delivered. What's planned after submission is at the end.

---

## Timeline

```mermaid
gantt
    title Wits Quest roadmap, 2026
    dateFormat YYYY-MM-DD
    axisFormat %d %b
    section Sprint 1
    Core loop (map, trivia, cards, CPU battles)   :done, s1, 2026-08-04, 2026-08-25
    Sprint 1 review with the tutor                 :milestone, done, 2026-08-13, 0d
    section Sprint 2
    Supabase Auth, PvP, streaks, offline, CI       :done, s2, 2026-08-26, 2026-09-15
    Sprint 2 review + live demo to Zayd            :milestone, done, 2026-09-15, 0d
    section Sprint 3
    Anti-cheat, trails, ranked, trading, territory :done, s3, 2026-09-15, 2026-09-29
    Supervisor meeting                             :milestone, done, 2026-09-26, 0d
    Stakeholder app review                         :milestone, done, 2026-09-28, 0d
    Milestone 3 demo                               :milestone, done, 2026-09-29, 0d
    section Sprint 4
    Themes, card pictures, sound, polish           :done, s4a, 2026-09-29, 2026-10-04
    Feature freeze                                 :milestone, done, 2026-10-04, 0d
    Testing, fixes and documentation               :active, s4b, 2026-10-04, 2026-10-11
    Final submission                               :milestone, 2026-10-11, 0d
```

## Milestones

| Date | Milestone | Delivered | Evidence |
| :--- | :--- | :--- | :--- |
| **13 Aug** | Sprint 1 review | Campus map, geofenced trivia, card collection, CPU battles, authoring console | [Sprint 1 review](../project/stakeholder-reviews.md#sprint-1-review-2026-08-13) |
| **15 Sep** | Sprint 2 review and live demo | Secure login, server-checked battles, live and async PvP, offline answers, deployed app, docs site | [Sprint 2 review](../project/stakeholder-reviews.md#sprint-2-review-2026-09-15) |
| **29 Sep** | Milestone 3 | Every Intermediate feature, plus anti-cheat, trails, ranked, trading, territory and achievements | [Features by Sprint](../project/sprint-features.md#sprint-3-fair-play-and-depth) |
| **4 Oct** | Feature freeze | Four themes, the six-tab layout, card pictures, sound | [Sprint 4 Plan](../sprints/SPRINT4_PLAN.md) |
| **8 to 10 Oct** | Full testing | 946 tests passing, load test with 0 failures, Lighthouse on 19 screens | [Test Results at a Glance](../development/test-report.md) |
| **11 Oct** | Final submission | The live app, API and documentation | [Home](../index.md) |

## Features delivered per sprint

```mermaid
flowchart LR
    S1["Sprint 1<br/>Core loop<br/>map · trivia · cards<br/>CPU battles · admin"] --> S2["Sprint 2<br/>Together<br/>Supabase Auth · live PvP<br/>async PvP · streaks<br/>leaderboard · offline"]
    S2 --> S3["Sprint 3<br/>Fair play + depth<br/>anti-cheat · trails · ranked<br/>trading · territory<br/>achievements · QR"]
    S3 --> S4["Sprint 4<br/>Polish<br/>themes · 6 tabs · card art<br/>sound · testing · docs"]
```

The full list of who built what is on [Features by Sprint](../project/sprint-features.md).

## After submission

Ideas we would build next, from user feedback, stakeholder reviews and our own testing:

| Idea | Where it came from |
| :--- | :--- |
| Code splitting so the first visit loads faster on phones | [Lighthouse](../development/test-report.md#2-lighthouse): phone performance 49 on the first visit |
| Name the map markers for screen readers and make them keyboard-reachable | Lighthouse accessibility checks on the Map |
| Move the API to a region nearer South Africa and keep it awake | [Load test](../development/test-report.md#1-api-load-test): about 0.5 s of each response is distance |
| End-to-end browser tests (Playwright) | [What isn't tested](../development/test-report.md#4-what-isnt-tested-and-whats-next) |
| More trivia questions and replayable events | [User Feedback](../project/user-feedback.md): players run out of trivia |
| A larger-text option | User feedback |
