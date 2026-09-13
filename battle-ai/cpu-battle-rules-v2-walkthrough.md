# CPU Battle Rules v2 — Walkthrough

What actually changed to implement idea 2 (per-stat quota) and idea 3
(attack/defense mitigation) from
`personal/cpu-battle-rules-v2-implementation-plan.md`, plus the lock-icon UI
you asked for on top. Branch: `mahlatse/cpu-battle-rules-v2` (off
`mahlatse/cpu-battle-rules`). Idea 1 needed no code — it was already fully
covered by the merged no-repeat-cards rule.

## Idea 2 — 2-use-per-stat quota, per side, per match

**`frontend/src/utils/battleEngine.ts`:**

- `BattleState` gains `playerStatUseCount` / `cpuStatUseCount`
  (`Record<StatAttribute, number>`, both start at all-zero in
  `createBattleState`).
- `MAX_STAT_USES_PER_MATCH = 2` and `canUseStat(counts, stat)` — the check
  callers use before offering a stat.
- `resolveRound` increments **only the current picker's own count** for the
  stat just played (the non-picker's card reveals that stat too, but didn't
  "pick" it, so their count is untouched). The function doesn't reject an
  over-quota pick itself — enforcement is up to callers (UI button
  disabling, AI candidate filtering), same tradeoff called out in the plan.

**`frontend/src/utils/battleAI.ts`:**

- `selectAIAction` takes an optional 5th `statUseCount` param (defaults to
  unlimited, so every existing caller/test is unaffected), filters
  `ALL_ATTRIBUTES` down to stats still under quota before any difficulty
  tier runs, with a defensive fallback to all 4 stats if the filtered list
  is somehow empty (can't happen in an ordinary 5-round match, but doesn't
  crash if it did). `BattleArena` passes `battleState.cpuStatUseCount` in.
- `selectAICounterCard` untouched — it never chooses a stat, only a card.

**`frontend/src/screens/BattleArena.tsx`:**

- Each stat button shows a lock icon and "N left" count, and disables once
  its side hits the quota (`!canUseStat(battleState.playerStatUseCount, attr)`).

## Idea 3 — attack blunted by the defender's Defense

**`frontend/src/utils/battleEngine.ts`:**

- `ATTACK_DEFENSE_MITIGATION = 0.3` and `applyAttackDefenseMitigation(stat,
attackerValue, defenderCard)` — a no-op for every stat except `attack`,
  where it subtracts 30% of the defender's Defense stat, floored at 0.
- `resolveRound` runs this before the category-edge bonus: raw stat value →
  mitigation (attack only) → category edge → compare. The _raw_ value is
  still what's stored on `RoundRecord.playerStatValue`/`cpuStatValue` — the
  mitigation only affects the comparison, not what gets displayed/recorded
  as the card's stat.

No `BattleArena.tsx` change was needed for this one — it's invisible math
inside the comparison, same UI either way.

## The lock UI you asked for (both mechanics)

**Stat buttons**: already covered above — locked stats show a padlock icon
in place of their usual icon, dim to 40% opacity, and disable.

**Cards**: previously (option A), a played card just vanished from the hand
strip. Changed to: the hand strip now always renders all 5 original cards
(`playerCards.map(...)` instead of `battleState.playerHand.map(...)`), and a
card no longer in `battleState.playerHand` (i.e. already played) renders
with a padlock overlay, dimmed, name/rarity hidden, and isn't clickable. So
a card visibly locks in place rather than disappearing.

## Test changes

`frontend/src/utils/battleEngine.test.ts` — new `describe` blocks:

- Quota starts at 0 for every stat, both sides.
- A pick only counts against whichever side is picker that round (verified
  both directions — player picking, then CPU picking after the pick flips).
- `applyAttackDefenseMitigation` — non-attack stats pass through unchanged,
  attack gets reduced by 30% of defense, floored at 0.
- An integration case: two cards with equal raw attack (50 vs 50, would tie
  without mitigation) but different defense now produce a real winner
  because of it.

`frontend/src/utils/battleAI.test.ts` — two new tests confirming
`selectAIAction` excludes an exhausted stat from its candidate list, at both
the medium (greedy) and easy (random) tiers.

No existing test needed changes — every existing fixture's numbers happened
to produce the same win/lose/tie outcome with mitigation applied as without
it (checked by hand for each one before running the suite, since a few of
them use `'attack'` as the compared stat).

## Verified

- `tsc --noEmit` — clean.
- `npm test` — 84/84 passing (7 new engine tests, 2 new AI tests), coverage
  gate holds (~92% statements, `battleEngine.ts` itself at 100%).
- `npm run build` — production build succeeds.
