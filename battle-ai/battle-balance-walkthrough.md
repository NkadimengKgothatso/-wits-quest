# Battle Balance — Walkthrough (Options A + E)

What actually changed to implement options A and E from
`personal/battle-balance-implementation-plan.md`. Branch:
`mahlatse/cpu-battle-rules`.

## Option A — no-repeat cards

**`frontend/src/utils/battleEngine.ts`, `resolveRound`:** after a round
resolves, the played card is filtered out of its side's hand:

```ts
playerHand: state.playerHand.filter((c) => c.id !== playerCard.id),
cpuHand: state.cpuHand.filter((c) => c.id !== cpuCard.id),
```

Both AI functions (`selectAIAction`, `selectAICounterCard`) already draw from
whatever hand array they're given, so once a card is gone from
`battleState.cpuHand` the CPU physically cannot pick it again — no change
needed on the AI side.

**`frontend/src/screens/BattleArena.tsx`:**

- The card-hand strip at the bottom now maps over `battleState.playerHand`
  (the remaining, unplayed cards) instead of the full `playerCards` list. A
  played card disappears from the strip the moment its round resolves, so
  there's no UI path left to replay it. Added a small label above the strip
  ("N cards left — each can only be played once") so the rule is visible,
  not just enforced silently.
- The post-round "pick a default active card" step (previously
  `(v + 1) % playerCards.length`, a naive cycle) now points at
  `nextState.playerHand[0]` / `nextState.cpuHand[0]` — the next actually-
  available card — since the old cyclic index could land on a card that had
  already been played and removed from hand.
- The 5-dot round-progress indicator in the scoreboard was hardcoded to
  `[0, 1, 2, 3, 4]`; switched to `Array.from({ length: battleState.maxRounds })`
  so it still matches reality once maxRounds isn't always 5 (see option E).

## Option E — rounds capped to deck size

**`frontend/src/utils/battleEngine.ts`, `createBattleState`:** the
`maxRounds` parameter's default changed from a hardcoded `5` to
`Math.min(playerDeck.length, cpuDeck.length)`. An explicit `maxRounds` still
overrides it (used throughout the test suite to keep round-mechanics tests
independent of this default). `BattleArena.startBattle` already called
`createBattleState` without passing `maxRounds`, so it picks up the new
default automatically — no BattleArena change needed there.

Net effect: a match is exactly as long as the smaller deck, and since each
card can only be played once (option A), "play every card once" is now the
literal definition of a full match rather than an emergent side effect of
5 cards happening to fit 5 rounds.

## Test changes

`frontend/src/utils/battleEngine.test.ts`:

- Split the old "5 max rounds by default" test into: a plain "defaults to
  medium difficulty" check, a new test asserting `maxRounds` derives from
  `Math.min()` of the two deck sizes (including mismatched deck sizes), and
  a test confirming an explicit `maxRounds` still overrides the default.
- The three "evaluates a round win/lose/tie correctly" tests and the
  "keeps the pick with the winner of the round" picker test now pass an
  explicit `maxRounds: 5` — they use a 2-card mock deck, so without that
  they'd hit the new deck-size-derived default of 2 rounds (target-wins 1),
  which would end the match after round 1 and break assertions that expect
  a second round to actually run. This isolates those tests from the
  option E default so they keep testing what they were meant to test.
- Added a test confirming a played card is removed from both hands after
  `resolveRound`.

No other test files needed changes — `frontend/src/__tests__/battleEngine.test.ts`
uses 5-card fixture decks throughout, so `Math.min(5, 5)` matches the old
hardcoded default and nothing there shifted.

## Verified

- `tsc --noEmit` — clean.
- `npm test` (Vitest + coverage) — 75/75 passing, coverage gate holds
  (~92% statements).
- `npm run build` — production build succeeds.

## Not done here (deferred)

Options B (no-repeat stat), C (deck-locked battles), D (reactive rules) are
still just proposals in the plan doc — not touched by this change.
