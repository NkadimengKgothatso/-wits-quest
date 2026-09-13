# PvP Feature — Implementation Plan

Sprint 2, Mahlatse. Consolidates what was three separate sections in
`personal/remaining-tasks-implementation-plan.md` (Async PvP backend, wire
the Async PvP screen, Live PvP) into one plan, since they're really one
feature — turn-based and real-time are two delivery modes of the same
thing (challenge someone, play cards against them, server decides who won),
not two unrelated tasks. Branch: `mahlatse/pvp` (one branch for the whole
feature, not three).

**Status (2026-09-10): all three delivery modes implemented — Live PvP,
Async PvP backend, and `AsyncPvP.tsx` wired to real data.** Open questions
1, 3, 4, 5, 6, 7 resolved per the recommendations below (rewards: Elo-gap-
based, flat 100/50/20 XP for win/draw/loss, shared by Live and Async via
`backend/src/utils/matchRewards.ts`). Question 2's extended
`ChallengeStatus` enum was adopted essentially as proposed. See
`personal/live-pvp-walkthrough.md` and `personal/async-pvp-walkthrough.md`.

**Revision note**: question 1's original recommendation below (simultaneous
secret picks for Live PvP, distinct from CPU/async's alternating picker) was
built first, then explicitly overridden — direct feedback was "it should be
exactly like when playing computer just multiplayer, 30 seconds timer pick
wait for other to pick etc." Live PvP now uses the **same alternating-picker
turn order as CPU/async battles** (win keeps the pick, tie holds, loss flips)
instead of both sides picking blind simultaneously, plus a real 30s
server-enforced turn timer that auto-picks (random remaining card + an
unlocked stat) if the current picker doesn't act — same UX shape as
`BattleArena.tsx`'s CPU-match timer and `handleAutoPlay()`. The rest of this
plan's Live PvP row (transport, where resolution happens) is unaffected; only
the round-mechanic cell changed. See the walkthrough for what actually got
rebuilt.

## The two modes, and what they share

|                          | Async PvP                                                                                                  | Live PvP                                                                                                                                                                                                                                                                                                                                                                                                                  |
| ------------------------ | ---------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Players present          | At different times — challenge, then each takes a turn whenever they open the app                          | At the same time — both online now                                                                                                                                                                                                                                                                                                                                                                                        |
| Round mechanic           | **Picker alternates** — same turn-order rule as CPU battles (win keeps the pick, tie holds, loss flips it) | **Picker alternates, same as CPU/async** — revised from an earlier simultaneous-secret-pick design after direct feedback that Live PvP should feel "exactly like playing the computer, just multiplayer": one side picks a card + stat each round, a 30s server-enforced timer auto-picks for them if they don't act, and the other side sees a "waiting for X to pick" state, same as `BattleArena.tsx`'s CPU-turn timer |
| Transport                | HTTP (`POST /api/battle/async/play-turn` or similar)                                                       | WebSocket (Socket.IO rooms, already built)                                                                                                                                                                                                                                                                                                                                                                                |
| Where a round is decided | Server (new — this task is what makes it server-authoritative)                                             | Server (new — currently the socket handler broadcasts both picks but never itself declares a round winner; comparison happens client-side today)                                                                                                                                                                                                                                                                          |

Both need: real decks (`user_decks`), some form of the CPU battle's
comparison rules (stat vs. stat, category edge — see open question 1
below), and a way to turn a finished match into XP/Elo/Essence applied to
both users' records plus a `battle_matches` row.

**Architecture decision: share the reward-application logic, not just the
comparison logic.** `backend/src/routes/battle.ts`'s `/record` handler
already has all of this — level-up loop, Elo/division-tier update,
pvpWins/Losses/Draws, `battle_matches` insert, and (as of the streaks work)
the streak multiplier applied to XP. That logic is currently only reachable
from the client-called `/record` endpoint. I'd extract the "apply a
finished match's outcome to both users' records" block into a shared
function (`backend/src/services/applyMatchResult.ts` or similar) that:

- `/record` keeps calling, for CPU matches (client remains the source of
  truth there — untouched, out of scope, that's F2/F31).
- The new async-PvP turn-completion handler calls directly (in-process,
  not over HTTP) once a match's server-computed outcome is final.
- The live-PvP socket handler calls the same way, once a match ends.

This avoids writing the level-up/Elo/division logic a third time, and means
a future fix to that logic (there's already a known gap — no cap check on
`pvpWins` etc., nothing exotic, just noting it's one place to fix instead
of three).

## Open questions

### 1. Turn/round comparison rules — same as CPU battles?

**Recommended: yes, reuse exactly what's built and tested** — same-stat
comparison, category-edge bonus, attack blunted by defense. One ruleset
across CPU, async, and live PvP is easier to explain to a player and to
reason about. Two things from the CPU engine I'd deliberately **not**
carry over:

- **No-repeat-cards / hand replenishment** — that mechanic exists because a
  CPU match needs to always reach a decision even with a short deck. PvP
  decks are real 5-card constructed decks (stat-budget capped), so a
  straightforward "each side's deck, once, best of 5" is enough — no
  replenishment logic needed.
- **Per-stat quota (2 uses/match)** — this one I'd keep, actually, for the
  same anti-spam reason it exists in CPU battles. Applies naturally to
  async (a per-side count tracked on the challenge record); for live PvP
  it's a per-side count tracked in the room state.

Where does this comparison logic live, code-wise? Frontend and backend
aren't a shared-package monorepo, so the server can't import
`battleEngine.ts` directly. I'd port the pure comparison functions
(`applyCategoryEdge`, `applyAttackDefenseMitigation`, the win/lose/tie
decision) into `backend/src/utils/battleResolution.ts`, unit-tested the
same way `battleEngine.test.ts` is — it's maybe 40 lines of pure logic, a
reasonable duplication to accept rather than restructuring the repo into a
real shared package mid-sprint (that restructure is a legitimate future
improvement, just a separate, bigger piece of work).

**Implementation note (2026-09-10)**: "real 5-card constructed decks" turned
out not to hold — new accounts only start with 3 starter cards, the exact
assumption that caused the CPU-battle and Live-PvP "best of 3, not 5" bugs
earlier this sprint. Rather than "each side's deck, once" as sketched above,
async plays each side's deck **in fixed order, cycling via
`deckIds[(roundNumber-1) % deckIds.length]`** — round-robin instead of a
stateful no-repeat/replenish tracker. This sidesteps that bug class
entirely (any deck length ≥ 2 sustains a full 5-round match, no immediate
repeats since consecutive rounds always land on different indices) and
fits async's actual constraint better: neither side is present in real
time to "have an active card" (Live PvP's model) or get an AI counter-pick
(CPU's model), so each side's next card is just whatever's next in their
snapshotted deck. See `personal/async-pvp-walkthrough.md`.

### 2. Async PvP challenge lifecycle

`AsyncPvPChallengeRecord`/`ChallengeStatus` in `schema.ts` only has
`'PENDING_DEFENDER_TURN' | 'COMPLETED' | 'EXPIRED'` — no room for the
Accept/Decline step `AsyncPvP.tsx`'s UI already expects (it has a
"Challenges" tab with those two buttons). Proposed extended enum:

```ts
type ChallengeStatus =
  'PENDING_ACCEPTANCE' | 'CHALLENGER_TURN' | 'DEFENDER_TURN' | 'COMPLETED' | 'EXPIRED' | 'DECLINED';
```

Round 1 picker = challenger (accepting flips status to `CHALLENGER_TURN`).
Whoever wins a round keeps picking (status stays on their turn); a tie
holds; a loss flips status to the other side's turn.

### 3. Persistence — Supabase only

No fallback of any kind (you've made this call already for the rest of the
backend) — if Supabase is unreachable, these endpoints fail like everything
else currently does. This also means decks come straight from the real
`user_decks` table; no mock-catalog seeding concerns.

### 4. Async PvP rewards

**Recommended: Elo-gap-based**, standard ranked-ladder style — winner gains
Elo from the loser scaled by the rating gap (upset wins pay more), loser
loses the mirrored amount (floor 0), modest flat XP/Essence for both sides
via the shared `applyMatchResult` helper (streak multiplier applies
automatically since that's already inside it). Exact K-factor/XP numbers
are your call when we get there — I'd propose specific numbers at
implementation time rather than guessing now.

### 5. Forfeit / 24h expiry

**Recommended: lazy-checked**, not a scheduled sweep. Any time a challenge
is read (`my-matches`, a turn attempt, challenge detail) and `expiresAt` has
passed while still active, it flips to `EXPIRED` right there and whoever
didn't move forfeits. Simpler than a cron job, correct as long as someone
eventually reads the challenge (which polling `my-matches` guarantees). A
real scheduled sweep is a Sprint-3-if-there's-time item.

### 6. Live PvP — reconnect behavior

The socket handler already emits `player_disconnected` but doesn't have
reconnect-into-the-same-room logic. **Recommended**: keep the room alive
for a short grace window (e.g. 60s) after a disconnect rather than tearing
it down immediately, so a dropped wifi connection doesn't instantly forfeit
the match — the room already tracks players by `userId` (not just
`socketId`), so a reconnect just needs to match on `userId` and rejoin.

### 7. "Play Turn" UI for async matches

**Recommended: a modal** over `AsyncPvP.tsx` (same pattern as
`TriviaModal.tsx` over `MapExplorer`) rather than a dedicated route/screen —
keeps it self-contained, no new navigation needed.

## Proposed endpoints & events

**Async (`backend/src/routes/asyncBattle.ts`, mounted under
`/api/battle/async`, all behind `authMiddleware`):**

- `POST /challenge` — `{ defenderId }` → new challenge from the caller's
  default deck vs. the defender's, `PENDING_ACCEPTANCE`, `expiresAt` = +24h.
- `GET /my-matches` — the four buckets `AsyncPvP.tsx` already expects
  (your-turn, waiting, pending invites, history); flips any expired-but-
  unflagged challenge to `EXPIRED` as part of the read.
- `POST /:id/accept` / `POST /:id/decline` — defender only.
- `POST /:id/play-turn` — `{ stat }` — only the side whose turn it is;
  server resolves the round from each side's next deck card (client sends
  only the stat, never a claimed outcome), updates history, flips/holds the
  turn, and on the final round calls the shared `applyMatchResult` helper
  and generates `defensiveTelemetry` for the loser.
- `GET /:id` — full challenge detail for the "Play Turn" modal.

**Live (extending `battleSocketHandler.ts`):**

- Keep `join_battle`/`submit_turn` as-is for the secret-pick mechanic, but
  have the server actually resolve each round (reusing the same
  `battleResolution.ts` port) instead of just broadcasting both raw picks —
  emit the decided outcome alongside the reveal.
- On match end, call the shared `applyMatchResult` helper and emit a
  `battle_end` event with the final result.
- Add the reconnect grace window from open question 6.

**Frontend:**

- `AsyncPvP.tsx`: replace the four mock arrays with `GET /my-matches`;
  wire Accept/Decline; add the "Play Turn" modal (open question 7) calling
  `POST /:id/play-turn`.
- `LivePvPArena.tsx`: replace mock arrays with the caller's real saved
  deck; connect to the socket (env-driven URL instead of hardcoded
  `localhost` — this exact gap is already tracked as F11); wire
  `join_battle`/`submit_turn`/listen for `battle_start`/round outcome/
  `battle_end`/`player_disconnected`; 15s round timer per the task spec.

**Implementation note (2026-09-10)**: built essentially as proposed, plus a
`GET /opponents` endpoint (not originally listed) for the "who do you want
to challenge" picker — `AsyncPvP.tsx` needed a real "browse registered
students" view, and the existing `GET /api/users` turned out to leak every
user's `passwordHash` to any caller (never actually used by any frontend
code before now); fixed that broader endpoint too rather than build a new
feature on top of a live secret leak. One deliberate gap vs. the endpoint
list above: `defensiveTelemetry` generation for the loser was **not**
built — out of scope for what was actually asked (the challenge/accept/
play lifecycle), and there's no existing telemetry-generation helper to
call into; flagged here as a known gap rather than guessed at. See
`personal/async-pvp-walkthrough.md`.

## Testing plan

- `backend/src/utils/battleResolution.test.ts` — mirrors
  `battleEngine.test.ts` for the ported comparison logic.
- `backend/src/routes/asyncBattle.test.ts` — challenge creation,
  accept/decline, a full round-by-round match to completion (turn-order
  flip, per-stat quota), "server ignores a client-supplied outcome and
  recomputes it" (the actual point of server-authoritative resolution),
  24h-expiry forfeit.
- `backend/src/services/applyMatchResult.test.ts` — the extracted
  reward/level-up logic, independent of which caller invokes it.
- Socket handler: harder to unit test cleanly (stateful, event-driven) —
  I'd smoke-test manually (two browser tabs) rather than force awkward
  socket mocks, matching how the rest of this codebase already treats
  Socket.IO code as outside its test suite.

## What's explicitly out of scope here

- Server-side enforcement for CPU battles (F2/F31) — untouched, `/record`
  keeps trusting the client for CPU matches.
- A real scheduled expiry sweep (lazy-check only, per open question 5).
- Setting up a genuine shared frontend/backend package — the
  `battleResolution.ts` port is a deliberate, acknowledged duplication
  instead.

## What I need from you

Answers to the 7 open questions (or "go with your recommendations" for
any/all), then I'll branch (`mahlatse/pvp`) and start — likely async first
since it's the simpler transport (HTTP, no socket lifecycle to manage),
then live PvP reusing the resolution logic and reward helper async
established.
