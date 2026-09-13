# "Game no longer plays 5 rounds" — Walkthrough

Branch: `mahlatse/cpu-battle-rules-v2`. Reported directly ("the game no
longer plays 5 rounds — it should play until any of us has 3, then it
grants a win; if not, the game continues"), not a planned task — fixed
straight from the report since the desired behavior was unambiguous once
the root cause was confirmed.

## Root cause

Option E (`battle-balance-implementation-plan.md`) made `createBattleState`'s
`maxRounds` default to `Math.min(playerDeck.length, cpuDeck.length)` instead
of a fixed 5, on the reasoning that "play your whole deck once" should be
the definition of a match. That's fine for a full 5-card deck, but
**every newly registered account only starts with 3 cards**
(`backend/src/routes/auth.ts`'s `starterCards`), so for any account that
hadn't collected more cards yet, `maxRounds` silently evaluated to `3` —
capping the match (and the win target, `Math.ceil(maxRounds/2)`) well
short of a real best-of-5, and sometimes ending it by round-count majority
before either side reached an actual decisive win total.

## The fix

`frontend/src/utils/battleEngine.ts`:

- `createBattleState`'s `maxRounds` default is back to a fixed `5`,
  independent of deck size — restores "best of 5, first to 3" as the
  standard rule regardless of how many cards either side owns.
- Because option A (no-repeat cards) still applies, a fixed 5-round default
  needed a way to sustain 5 rounds even for a 3-card deck: `resolveRound`
  now replenishes a side's hand from its full deck once it empties, with
  the card that was just played excluded from the replenished hand so it
  still can't be played twice in a row (there's always at least one other
  card played in between).
- For a full-size deck this replenishment is unreachable within a single
  match — the hand doesn't empty before a winner is decided at 5 rounds
  anyway — so behavior for anyone with 5+ cards is identical to before this
  fix. It only changes anything for short decks.

`frontend/src/screens/BattleArena.tsx`: no changes needed — it already
calls `createBattleState` without an explicit `maxRounds`, so it picks up
the new fixed default automatically, and the hand-strip lock UI already
reads from `battleState.playerHand` each render, so a replenished card
unlocking again just falls out of that existing logic.

## Test changes

`frontend/src/utils/battleEngine.test.ts`:

- Replaced the option-E "derives maxRounds from deck size" test with one
  confirming the new fixed-5 default regardless of deck size.
- Added a test for the hand-replenishment mechanic itself: runs a 2-card
  deck through enough rounds to empty and replenish both hands, confirming
  the just-played card is excluded from the replenishment (no immediate
  repeat) and that a real card is still available afterward rather than a
  crash or an empty pick.
- `docs/development/cpu-battle-rules.md` section 1 updated to match.

## Verified

- `tsc --noEmit` — clean.
- `npm test` — 85/85 passing (only the one expected option-E test needed
  rewriting; nothing else broke), coverage gate holds,
  `battleEngine.ts` itself at 100%.
- `npm run build` — production build succeeds.
