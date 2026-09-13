# Battle Hub — Implementation Plan

Sprint 2, Mahlatse — Domain 2 (Battle Engine, Live & Async Multiplayer),
**Task 2.1** of 3, from `SPRINT2_FEATURE_SELECTION_AND_TASK_GUIDE.md`.

**Status (2026-09-10): implemented as proposed**, on `mahlatse/cpu-battle-rules`
(not a separate `mahlatse/battle-hub` branch — same feature area as the
rest of that branch's work). See `battle-hub-walkthrough.md` for what
actually changed.

## The task, as written in the doc

> Remove `onClick={() => alert("Multiplayer is coming soon!")}`. Replace with
> a sub-navigation state allowing students to choose between: Kudu Computer
> Bot Duel (CPU mode with Easy, Medium, Hard), Asynchronous Turn-Based
> Challenges (`AsyncPvP`), Synchronous Real-Time WebSocket Duel
> (`LivePvPArena`). **Acceptance criteria**: Clicking multiplayer navigates
> to live or async battle screens without browser alerts.

Confirmed the alert is still exactly where the doc says —
`frontend/src/screens/BattleArena.tsx`, the "Multiplayer Mode Selection"
card's `onClick`.

## Current state

- `BattleArena.tsx` already has an internal `Mode` type
  (`'hub' | 'ai' | 'multiplayer'`) and a `mode` state driving what's on
  screen — the hub is two cards: "Kudu Computer Challenge" (fully wired,
  picking a difficulty calls `startBattle()`), and "Async Multiplayer" (the
  alert).
- `AsyncPvP.tsx` and `LivePvPArena.tsx` both exist, both `export default
function` with **no props** — fully self-contained, currently mock data
  (that's tasks 2.3 and 2.2, separately). Neither has a back/exit button of
  its own.
- Neither is mounted anywhere in `App.tsx` (that's the unrelated F13/F14
  unreachable-screens issue tracked elsewhere) — so this task can't lean on
  app-level routing to get to them.

## Proposed approach

Keep this contained inside `BattleArena.tsx`, the same way the existing
`'ai'` mode already works — no `App.tsx` routing changes needed:

1. Extend `Mode` to `'hub' | 'ai' | 'async' | 'live'` (drop the unused
   `'multiplayer'` value — it was never actually used as a render branch,
   the hub always stayed on `'hub'` and the alert fired instead of a
   transition).
2. The "Async Multiplayer" hub card becomes two real cards — one for async,
   one for live — each calling `setMode('async')` / `setMode('live')`
   instead of the alert. (The doc's acceptance criteria wants both reachable
   as distinct destinations, not one combined "multiplayer" card.)
3. Add `mode === 'async' && <AsyncPvP onBack={() => setMode('hub')} />` and
   `mode === 'live' && <LivePvPArena onBack={() => setMode('hub')} />`
   branches, matching how `'ai'` mode is already rendered inline.
4. Add an optional `onBack?: () => void` prop to both `AsyncPvP.tsx` and
   `LivePvPArena.tsx`, rendering the same back-chevron button style
   `BattleArena`'s own match view already uses, calling it if provided.
   (Optional, not required, so neither screen breaks if something else
   renders them without it later.)

This is a small, mechanical change — the only real decision is #2/#3 above
(two cards + inline render vs. some other navigation scheme), and I think
it's clearly the right fit given how the rest of `BattleArena` already
works. Flagging it rather than just doing it, per your "confirm before
coding" preference — but I don't see a real fork in the road here beyond
"does this look right to you."

## What's explicitly out of scope here

- Making `AsyncPvP.tsx` / `LivePvPArena.tsx` functional (tasks 2.3 and 2.2 —
  separate, later).
- Any App.tsx-level routing changes (not needed for this task).

## Testing plan

Extend `frontend/src/App.test.tsx` or add a small `BattleArena.test.tsx` if
one doesn't exist yet — click through hub → async → back, hub → live → back,
assert no `window.alert` is called (can spy on `window.alert` to assert it's
never invoked) and the right screen's content renders. Manual check in the
browser too, since this is UI navigation.

## What I need from you

Confirm the approach above, or tell me if you want async/live reachable a
different way (e.g. a dedicated route in `App.tsx` instead of inline
`BattleArena` state) — then I'll branch and implement.
