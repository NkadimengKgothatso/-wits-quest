# Battle Balance — Implementation Plan (Proposals)

Sprint 2, Mahlatse — PvP & Offline, follow-on to task 4.

**Status (2026-09-08): A and E are implemented** — see
`personal/battle-balance-walkthrough.md` for what actually changed. B, C and D
are still just proposals below, not built.

## The problem

The rulebook change already merged (turn-order flip + category edge + payout
curve, see [cpu-battle-rules.md](cpu-battle-rules.md)) answers the five
questions the handover guide listed, but it doesn't stop a match from being
won too easily. Two things make that possible right now, in both
`frontend/src/screens/BattleArena.tsx` and the engine it drives:

1. **A card can be replayed every round.** The card-hand strip lets you tap
   any card in your hand before each pick (`setPlayerCardIdx(i)`), with no
   record of what's already been played. Nothing stops you from tapping your
   single highest-stat card 5 times in a row and always picking its best
   stat — the "deck" of 5 cards never actually gets used as 5 distinct
   decisions. The CPU has the same freedom on its side.
2. **The card pool isn't your committed deck.** `BattleArena` battles with
   whatever `getMockUserCards` returns (all owned cards) or the hardcoded
   `PLAYER_CARDS`/`CPU_CARDS` arrays — not the 5-card, stat-budget-capped
   deck a player actually builds in `DeckBuilder`. So deck-building strategy
   (the stat-budget cap, the 1-legendary limit) has nothing to do with how a
   battle plays out yet.

Below are options to fix this, grouped the way you described it: stopping
repeat-card spam, restricting to the real deck, and reacting to what the
other side actually did.

## Option A — No-repeat cards (spend each card once per match) — ✅ Implemented

Each side's 5 cards can each be played once; once a card is used it's
removed from that side's pickable pool for the rest of the match. A 5-round
match then naturally uses all 5 cards, no more, no less.

- **Fixes:** the exact "replay your best card every round" problem.
- **Effort:** small. `BattleState` gains a `usedPlayerCardIds` /
  `usedCpuCardIds` set (or just filter `playerHand`/`cpuHand` down each
  round in `resolveRound`); the hand strip and the AI's card pool both read
  from the remaining set.
- **Side effect:** naturally caps `maxRounds` at the deck size (5) — see
  Option F, they pair well together.

## Option B — No-repeat stat (stop spamming your best stat)

Whoever is picker can't choose the same stat two rounds running (their own
last pick, not the opponent's).

- **Fixes:** the secondary version of the same problem — even with fresh
  cards each round, a deck can still be stacked so one stat wins almost
  every time.
- **Effort:** small. Track `lastPlayerStat` / `lastCpuStat` in `BattleState`,
  disable that one attribute button for the picker's next turn.
- **Tradeoff:** with only 4 stats, this is a mild constraint, not a hard
  wall — still worth doing, just don't expect it alone to fix everything.

## Option C — Deck-locked battles (only your real deck, not your whole collection)

Pull `playerHand` from the player's saved default deck (via `deckService` /
`DeckBuilder`'s 5-card, stat-budget-capped, max-1-legendary deck) instead of
"all owned cards" or the hardcoded arrays. Generate CPU decks under the same
constraints so it's a fair fight both ways.

- **Fixes:** makes deck-building actually matter — a maxed-out account can't
  just always field its 5 best cards regardless of budget; you're battling
  with the deck you built, not your full collection.
- **Effort:** medium. Needs `DeckBuilder` reachable (it currently isn't —
  that's F13/F14, a separate fix) and `deckService` wired into
  `BattleArena`'s card-loading `useEffect`.
- **Recommendation:** worth doing, but treat as a slightly bigger follow-up
  since it depends on unblocking `DeckBuilder` first.

## Option D — Reactive / conditional rules ("if the opponent did X…")

A few concrete ways to make a round depend on what just happened, not only
on static stats:

- **Momentum handicap:** win 2 rounds in a row and your next round's
  comparison takes a small penalty (e.g. -5%) until you lose one — stops a
  single strong opening from running away with the match.
- **Read the opponent:** if you lost the last round to stat X, and you're
  picker next, choosing X again gives you a small bonus (you "learned" what
  beat you) — rewards adapting rather than just re-picking the same play.
- **Underdog comeback:** if you're down by 2+ round wins, your stat gets a
  small boost until the gap closes — keeps a 0-2 start from being a foregone
  conclusion in a Bo5.
- **Effort:** small–medium per rule, and they compose (you don't have to
  take all three). Main risk is stacking too many modifiers makes outcomes
  feel arbitrary rather than skill-based — I'd suggest picking at most one
  or two of these to start.

## Option E — Cap rounds to deck size — ✅ Implemented

Set `maxRounds` to match how many cards are actually in the deck being
played (5, if Option A is in) instead of a number configured independently
of the deck. Makes "use your whole deck once" the literal definition of a
match rather than an emergent side effect.

- **Effort:** trivial once Option A exists — `createBattleState` can derive
  `maxRounds` from `Math.min(playerDeck.length, cpuDeck.length)`.

## Recommended starting combo

Given effort vs. impact, my suggestion is:

1. **A + E together** — no-repeat cards, rounds = deck size. Cheapest fix,
   and it's the one that most directly answers what you described ("can't
   use a card twice").
2. **B** as a quick follow-on once A is in — no-repeat stat closes the
   remaining "always pick your best number" loophole.
3. **One** momentum/comeback rule from **D** (I'd pick the underdog comeback
   — easiest to explain to a player and least likely to feel unfair) if
   there's time this sprint.
4. **C** (deck-locked battles) as a Sprint 3 item, once `DeckBuilder` is
   reachable — bundling it with that fix makes more sense than doing it
   twice.

## What I need from you

Which of A–E (or which specific sub-options within D) do you want built now
vs. deferred? Once you confirm, I'll implement the selected set on a new
branch and write a walkthrough doc for what actually changed, same as the
rulebook change.
