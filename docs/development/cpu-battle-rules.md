# CPU Battle Rulebook

Sprint 2, Mahlatse — PvP & Offline, task 4 ("Redesign the CPU battle rules"),
plus the balance/variety follow-ons in
`battle_AI_docs/battle-balance-implementation-plan.md` (options A + E) and
`battle_AI_docs/cpu-battle-rules-v2-implementation-plan.md`. This is the rulebook
the client-side engine (`frontend/src/utils/battleEngine.ts`,
`frontend/src/utils/battleAI.ts`) and `BattleArena.tsx` implement for a match
against Kudu Computer.

> Everything below is enforced client-side only, same as before this change.
> Server-side enforcement of battle outcomes is tracked separately as F2/F31 —
> the server still just records whatever result the client reports.

## 1. How many rounds, and card reuse

Best of 5, first to 3 — fixed, independent of deck size. A round is won
outright once either side reaches a majority (`Math.ceil(maxRounds / 2)` =
3 of 5), otherwise the match plays out the full 5.

> **Fixed 2026-09-09:** this used to default to
> `Math.min(playerDeck.length, cpuDeck.length)` (option E) instead of a
> fixed 5 — which silently capped every match at 3 rounds for any account
> still on its 3 starter cards (every new registration), ending the match
> before either side could reach the actual win target. See
> `battle_AI_docs/README.md` for the walkthrough.

**A card can't be played twice in a row** — the instant it's played it's
removed from that side's hand, so it can't come up again until every other
card in that side's deck has also been played, at which point the hand
replenishes from the full deck (minus whatever was just played, so there's
still always at least one other card in between). For a full-size deck this
never actually triggers within a match — the hand doesn't empty before a
winner's decided — so it plays out exactly like a strict one-use-per-card
rule; it only kicks in for a short deck, so a best-of-5 can always be played
to a real decision instead of running out of cards partway through. In the
UI, a played card stays visible in the hand strip but shows locked (padlock
icon, dimmed) instead of disappearing, so it's clear it's spent rather than
just gone — and unlocks again once its side's hand cycles back to it.

## 2. Who picks

**The player always picks** — every round, the player chooses the card and
stat, and Kudu counters with its best card for that stat
(`selectAICounterCard`). Kudu never gets its own turn to choose a stat.

> **Changed 2026-09-10:** this used to alternate — whoever won a round kept
> picking, a tie held it, and a loss handed the pick to Kudu, which would
> then auto-play its own turn a second or so later with no visible timer
> running (the countdown only ever ran on the player's own pick). That made
> the game look like it was "playing itself" on the turns Kudu picked,
> especially since the hand-off wasn't obvious. Removed by direct request —
> the player now plays every round themselves. `BattleState.picker` and
> `RoundRecord.picker` are kept as fields (always `'player'`) rather than
> removed outright, since `RoundRecord` reuses the same `'player' | 'cpu'`
> type to label which side's card had the category edge that round — an
> unrelated, still-live concept. `selectAIAction` (the CPU's own
> stat-and-card decision function) is unused by the live game now but stays
> in `battleAI.ts`, still directly unit-tested — it's part of a separate AI
> difficulty-evaluation harness (`aiEngineValidation.ts`/`testRunner.ts`),
> not dead code specific to this feature.

## 3. What happens on a tie

A tie round is scored to neither side and still counts toward the 5-round
limit. (It used to also matter for who picks next — see §2 — but since the
player always picks now, that part is moot.)

## 4. Whether a card's category gives it an edge

Cards carry a `category` (`Science | History | Landmarks | Lifestyle | Sports`).
Categories counter each other in a 5-cycle, one step each way:

```
Science → Landmarks → History → Lifestyle → Sports → Science
```

If a card's category counters its opponent's, its stat value for that round
gets a flat **+8%** bonus (rounded) before the comparison. Same category or an
unrelated pairing gives no bonus. A card with no category (older/mock data)
never gets or gives a bonus.

This is enforced in `applyCategoryEdge` / `CATEGORY_COUNTERS` in
`battleEngine.ts` and surfaced on `RoundRecord.categoryEdge` (`'player' | 'cpu' | null`)
for the UI to show a "Category Edge" badge.

## 5. Stat variety — a 2-use quota per side, per match

Each side can pick the same stat as the comparison stat **at most twice**
per match (`MAX_STAT_USES_PER_MATCH`) — only the pick counts, not the value
the other side happens to reveal that round. Once a side has used a stat
twice, that stat locks (padlock icon, disabled button) for that side only
for the rest of the match; the other side's quota for it is untouched. This
stops a match degenerating into "always pick your best stat" — with 4 stats
and a 5-round match, real variety is now required. `cpuStatUseCount` still
exists on `BattleState` for symmetry but never increments in live play, since
Kudu never picks (see §2).

## 6. Attack is blunted by the defender's Defense

Attack is the one stat that isn't compared head-on. When the round's stat is
`attack`, each side's effective attack value is reduced by 30% of the
_other_ side's Defense stat before anything else applies
(`ATTACK_DEFENSE_MITIGATION = 0.3`, floored at 0) — so a high-Defense card
is a real answer to attack, not just a stat that only matters when Defense
itself gets picked. Defense, Speed and Brains still compare head-on,
unaffected. This runs before the category-edge bonus, so a countering
category boosts the already-mitigated value.

## 7. Where things stand on the earlier ideas

Two things worth noting so a later read of this doc doesn't wonder why
they're missing:

- **"Reuse it, just not consecutively"** was considered and dropped in favor
  of the stricter rule above (a card can't be reused at all, not just not
  back-to-back) — see
  `battle_AI_docs/cpu-battle-rules-v2-implementation-plan.md`, idea 1.
- **A full attack-vs-defense _replacement_** (comparing attack against the
  opponent's defense instead of their attack, redefining what picking a stat
  even means) was considered and deferred in favor of the additive
  mitigation above, which doesn't touch how the other three stats compare.
  Flagged in the same doc as a "maybe later" if there's sprint time for a
  bigger combat-system change.

## 8. What a win or a loss pays out

| Outcome | XP                               | Essence                      | Elo                                  |
| ------- | -------------------------------- | ---------------------------- | ------------------------------------ |
| Win     | `150 × difficulty multiplier`    | `45 × difficulty multiplier` | `+12 / +18 / +25` (easy/medium/hard) |
| Draw    | `75 × difficulty multiplier`     | `20 × difficulty multiplier` | `0`                                  |
| Loss    | `5 / 10 / 15` (easy/medium/hard) | `0`                          | `-18 / -14 / -8` (easy/medium/hard)  |

Difficulty multiplier: easy `1.0`, medium `1.2`, hard `1.5`.

Reasoning for the loss row: losing to a harder opponent is expected and
shouldn't be devastating, so the Elo penalty _shrinks_ as difficulty rises —
the opposite direction from the win bonus, which _grows_. This also replaces
the old flat `-20 XP` punishment with a small difficulty-scaled consolation
reward, so attempting a harder match is never worse for XP than an easy one
even when you lose.

## Where this is implemented

- `frontend/src/utils/battleEngine.ts` — `createBattleState`, `resolveRound`,
  `calculateRewards`, `CATEGORY_COUNTERS`, `applyCategoryEdge`,
  `canUseStat`/`MAX_STAT_USES_PER_MATCH`, `applyAttackDefenseMitigation`.
- `frontend/src/utils/battleAI.ts` — `selectAICounterCard` picks Kudu's
  response card once the player has chosen a stat. `selectAIAction` (Kudu
  choosing its own card + stat) is no longer called from the live game but
  stays as tested, standalone AI logic — see the difficulty-evaluation
  harness in `aiEngineValidation.ts`/`testRunner.ts`.
- `frontend/src/screens/BattleArena.tsx` — the player-pick UI, shows the
  category-edge badge, locks a stat button once its quota is spent and shows
  a "uses left" count, and locks (rather than removes) a played card in the
  hand strip.
