# Battle AI Docs

Everything documenting the Kudu Computer battle work this sprint — plans,
walkthroughs, and the merged rulebook — in one place. Sprint 2, Mahlatse,
Domain 2 (Battle Engine, Live & Async Multiplayer — 3 tasks) plus the
rules/balance follow-ons that came out of task 2.1's redesign.

## Status at a glance

| #   | What                                                                                                                                      | Plan                                                                                          | Walkthrough                                                               | Status                                                                  |
| --- | ----------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| 1   | CPU battle rules redesign — turn order, category edge, payout curve                                                                       | _(handover doc, task 4)_                                                                      | —                                                                         | ✅ Merged — see the [rulebook](../docs/development/cpu-battle-rules.md) |
| 2   | Battle balance — no-repeat cards (A), rounds = deck size (E)                                                                              | [battle-balance-implementation-plan.md](battle-balance-implementation-plan.md)                | [battle-balance-walkthrough.md](battle-balance-walkthrough.md)            | ✅ Merged (`mahlatse/cpu-battle-rules`)                                 |
| 3   | CPU battle rules v2 — per-stat quota, attack/defense mitigation, lock UI                                                                  | [cpu-battle-rules-v2-implementation-plan.md](cpu-battle-rules-v2-implementation-plan.md)      | [cpu-battle-rules-v2-walkthrough.md](cpu-battle-rules-v2-walkthrough.md)  | ✅ Merged (`mahlatse/cpu-battle-rules-v2`)                              |
| 4   | Best-of-5 fix — matches were capping at 3 rounds for new accounts (3 starter cards) instead of playing a real best-of-5                   | _(direct bug report, no separate plan)_                                                       | [best-of-5-fix-walkthrough.md](best-of-5-fix-walkthrough.md)              | ✅ Merged (`mahlatse/cpu-battle-rules-v2`)                              |
| 5   | Battle hub (Domain 2, task 2.1) — replace the "coming soon" alert with real navigation to CPU/Async/Live modes                            | [battle-hub-implementation-plan.md](battle-hub-implementation-plan.md)                        | [battle-hub-walkthrough.md](battle-hub-walkthrough.md)                    | ✅ Merged (`mahlatse/cpu-battle-rules`)                                 |
| 6   | Live PvP (Domain 2 task 2.2) — real-time, server-authoritative, no wagering, alternating-picker + 30s timer (matches CPU battles exactly) | [personal/pvp-feature-implementation-plan.md](../personal/pvp-feature-implementation-plan.md) | [personal/live-pvp-walkthrough.md](../personal/live-pvp-walkthrough.md)   | ✅ Merged (`mahlatse/pvp`)                                              |
| 7   | Async PvP backend + wire the screen (Domain 2 task 2.3)                                                                                   | [personal/pvp-feature-implementation-plan.md](../personal/pvp-feature-implementation-plan.md) | [personal/async-pvp-walkthrough.md](../personal/async-pvp-walkthrough.md) | ✅ Merged (`mahlatse/pvp`)                                              |
| 8   | CPU battles — removed Kudu's picker turn; the player now picks every round                                                                | _(direct bug report, no separate plan)_                                                       | —                                                                         | ✅ Merged (`mahlatse/pvp`)                                              |

The **rulebook** — the settled, current ruleset the engine actually
implements — lives at
[`docs/development/cpu-battle-rules.md`](../docs/development/cpu-battle-rules.md),
not in this folder: it's wired into the MkDocs nav and referenced by path
from code comments in `battleEngine.ts`/`battleAI.ts`, so it stays with the
rest of the merged documentation rather than living alongside these
in-progress planning docs. Everything in _this_ folder is the trail of how
it got there — proposals, decisions, and what actually changed for each
step — plus whatever's still ahead.

## Chronological log

**1. CPU battle rules redesign** (merged, `mahlatse/cpu-battle-rules`) —
the original task 4 rework: who picks the stat each round and how that
turn flips, category-vs-category bonus, and the win/draw/loss payout curve.
Wrote the rulebook doc for the first time. No plan/walkthrough pair exists
for this one — it predates adopting that workflow this sprint.

**2. Battle balance, options A + E** (merged, same branch) — closed the
"just replay your best card every round" loophole: a card can be played at
most once per match (A), and a match is now exactly as long as the smaller
deck (E) instead of a hardcoded 5 rounds. Options B (no-repeat-stat), C
(deck-locked battles) and D (reactive rules — momentum/comeback) were
proposed alongside these but not built.

**3. CPU battle rules v2** (merged, `mahlatse/cpu-battle-rules-v2`) — three
more ideas, refined into two real changes: a 2-use-per-stat quota per side
per match (stops "always pick your best number"), and attack now gets
blunted by 30% of the defender's Defense stat before comparison (the other
three stats still compare head-on). Also added the lock-icon UI: a spent
card locks in place in the hand strip instead of vanishing, and an
exhausted stat's button locks the same way.

**4. Best-of-5 fix** (merged, same branch) — reported directly: matches
were ending after 3 rounds instead of 5. Root cause was option E's
deck-size-derived match length colliding with new accounts only owning 3
starter cards. Fixed the default back to a fixed 5 rounds / first-to-3, and
taught the engine to replenish a spent hand from the full deck (minus
whatever was just played) so a short deck can still sustain a full match.

**5. Battle hub** (merged, same branch) — the actual task 2.1, not just its
rules-redesign side quest. Replaced the `alert("Multiplayer is coming
soon!")` with two real hub cards (Async Multiplayer, Live PvP Duel) that
navigate to `AsyncPvP`/`LivePvPArena` inline, same pattern the CPU-match
mode already used. Both screens gained an optional `onBack` prop.

**6. Live PvP** (merged, `mahlatse/pvp`) — real-time, server-authoritative
(the server fetches both real decks, resolves every round itself, and
rejects an invalid pick — the client only ever sends which card+stat it
chose). Ported the CPU ruleset server-side
(`backend/src/utils/battleResolution.ts`), extracted the reward/level-up
logic so CPU and PvP matches share it
(`backend/src/services/applyMatchResult.ts`), and rewrote the socket
handler with real decks, reconnect handling (60s grace), and the same
short-deck replenishment fix as item 4. No card wagering — checked against
the course brief directly; trading (separate, mutual, opt-in) is the
brief's only card-exchange mechanic, battles just decide a winner.
Verified live with two real socket connections against the actual running
backend and Supabase, not just unit tests.

**6b. Live PvP revised to match CPU battles exactly** (same branch,
`mahlatse/pvp`) — feedback after using it: "it should be exactly like when
playing computer just multiplayer, 30 seconds timer pick wait for other to
pick etc." Replaced the simultaneous-secret-pick design with the same
alternating-picker turn order CPU/async battles use (one side picks a card +
stat, win keeps the pick, tie holds, loss flips), added a real
server-enforced 30-second turn timer that auto-picks if the picker doesn't
act in time (mirrors `BattleArena.tsx`'s `handleAutoPlay()`), and a
synchronized countdown + "waiting for X to pick" state on the frontend using
the same radial SVG timer ring and stat lock icons the CPU match screen uses.
Re-verified live: a full match to a draw, a deliberate 30s-timeout auto-pick,
and a rejected stale repeat-pick, all confirmed against the running server +
real Supabase. See `personal/live-pvp-walkthrough.md`'s revision section.

**8. CPU battles — the player always picks now** (same branch) — reported
directly: the alternating picker (win keeps the pick, tie holds, loss flips
to Kudu) meant Kudu occasionally took its own turn, auto-playing after ~0.9s
with no timer running at all — looked like the game was playing itself.
Removed: `resolveRound`'s next-picker is now always `'player'`; the "Kudu's
picker turn" effect, `executeCpuTurn`, and the "KUDU COMPUTER IS
CHOOSING…" UI state are gone from `BattleArena.tsx`. `BattleState.picker` /
`RoundRecord.picker` stay as fields (always `'player'`) since `RoundRecord`
reuses the same type to label which side had the category edge — an
unrelated concept. `selectAIAction` (Kudu's own card+stat decision) is no
longer called live but stays in `battleAI.ts`, still directly unit-tested by
its own test suite and the separate AI difficulty-evaluation harness. See
the [rulebook](../docs/development/cpu-battle-rules.md) §2.

**9. Async PvP** (same branch) — the last of the three Domain 2 tasks.
Reported directly as broken: `AsyncPvP.tsx` was 100% hardcoded demo data
("Thabo Nkosi", "Lerato Dlamini"), the "Challenge"/Accept/Decline buttons
did nothing, and there was no way to even see other registered students.
Built the real lifecycle: new `backend/src/routes/asyncBattle.ts`
(`/opponents`, `/my-matches`, `/:id`, `/challenge`,
`/:id/accept`/`/decline`, `/:id/play-turn`) with a 6-status challenge
state machine (`PENDING_ACCEPTANCE → CHALLENGER_TURN/DEFENDER_TURN →
COMPLETED/EXPIRED/DECLINED`), whose-turn-it-is and each side's per-stat
quota both derived from `roundsHistory` rather than stored redundantly
(`asyncChallengeState.ts`), reusing `battleResolution.ts` for round
resolution and `applyMatchResult` for rewards (extracted the reward
constants/Elo math into a new `matchRewards.ts` shared with Live PvP).
Lazy-checked 24h expiry with real forfeit-and-reward-the-other-side
behavior. Rewrote `AsyncPvP.tsx` end to end — a real "browse students"
challenge picker, the four tabs wired to live data with 20s polling, and a
Play Turn modal. Also fixed an adjacent issue found along the way:
`GET /api/users` was leaking every user's `passwordHash` to any caller
(never actually used before this feature), and deleted a fully orphaned
`mockDb.ts` local-memory fallback (zero imports anywhere) left over from
before this sprint's Supabase-only revert. Verified live against the real
backend + Supabase: full challenge → accept → alternating-turn → completion
→ reward-persisted flow, plus decline and both expiry paths (lapsed invite,
mid-match forfeit). See `personal/async-pvp-walkthrough.md`.

**9b. Async PvP — real ruleset parity + full arena UI** (same branch) —
follow-up feedback: async's rules should genuinely match Kudu's, not just
resemble them, and the in-progress screen should look like the Kudu battle
arena, not a compact modal. Replaced the round-robin card auto-pick with
the real no-repeat-until-hand-exhausted rule CPU/Live already use
(`deriveUsedCardIds`, `nextAvailableCard`) — the picker now genuinely
chooses which card to play, not just which stat. Built a new full-screen
`AsyncBattleArena.tsx`, modeled directly on `BattleArena.tsx`'s CPU-match
screen: same `var(--color-*)` tokens, scoreboard with round pips, avatar
standings row, category-edge callout, side-by-side card panels, locked
stat/card icons — no 30s countdown though, since async's whole point is
"respond whenever it's your turn" (only the 24h overall expiry applies).
Re-verified live: card ownership/reuse validation, a full match played by
actually selecting cards, reward persistence. See the revision section of
`personal/async-pvp-walkthrough.md`.
