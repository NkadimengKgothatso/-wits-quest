# Battle Hub — Walkthrough

What actually changed to implement `battle-hub-implementation-plan.md`
(Domain 2, task 2.1). Branch: `mahlatse/cpu-battle-rules` (same branch as
the rest of the battle-rules work — battle hub is UI shell for reaching
PvP modes, same file (`BattleArena.tsx`) that branch already owns).

## `frontend/src/screens/BattleArena.tsx`

- `Mode` extended from `'hub' | 'ai' | 'multiplayer'` (the `'multiplayer'`
  value was dead — never used as a render branch) to
  `'hub' | 'ai' | 'async' | 'live'`.
- The single "Async Multiplayer" hub card with
  `onClick={() => alert("Multiplayer is coming soon!")}` is now two real
  cards: **Async Multiplayer** (`setMode('async')`) and **Live PvP Duel**
  (new, `setMode('live')`) — matching the plan's read of the acceptance
  criteria wanting both reachable as distinct destinations.
- Two new render branches, same pattern the existing `'ai'` mode already
  uses (inline render, no `App.tsx` routing change):
  ```tsx
  if (mode === 'async') return <AsyncPvP onBack={() => setMode('hub')} />;
  if (mode === 'live') return <LivePvPArena onBack={() => setMode('hub')} />;
  ```

## `frontend/src/screens/AsyncPvP.tsx` and `LivePvPArena.tsx`

Both gained an optional `onBack?: () => void` prop, rendered as a
back-chevron button (same visual language as `BattleArena`'s own match-view
back button) next to each screen's title, shown only when a caller
actually provides `onBack` — so neither screen breaks if something else
renders them without it later.

## Testing

New `frontend/src/screens/BattleArena.test.tsx` — 4 tests: hub shows all
three cards, clicking async/live never calls `window.alert` (spied), and
hub → async → back and hub → live → back both round-trip correctly
(asserting on the screens' actual title text, not implementation details).

## Verified

- `tsc --noEmit` — clean.
- `npm test` — 89/89 passing (4 new), coverage gate holds.
- `npm run build` — production build succeeds.
- No `chromium-cli`/Playwright available in this environment for an
  automated screenshot pass — relied on the interaction tests above
  instead, which exercise the same click-through path a manual check
  would. Dev server was left running for a manual look if wanted.
