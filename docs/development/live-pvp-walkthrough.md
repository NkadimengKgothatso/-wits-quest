# Live PvP — Walkthrough

## 2026-09-09 revision: alternating picker + 30s timer

The version below (original walkthrough) used simultaneous secret picks —
both sides submit blind, then both are revealed together. Direct feedback
after using it: "it should be exactly like when playing computer just
multiplayer, 30 seconds timer pick wait for other to pick etc." Rebuilt to
match `BattleArena.tsx`'s CPU-match flow exactly instead:

- **`backend/src/services/battleSocketHandler.ts`** — rewritten around a
  single `room.picker` (0 or 1), same as CPU battles' `BattlePicker`. Only
  the current picker's `submit_turn` is accepted (`turn_error` for the other
  side); their card is resolved against whatever card the _other_ side
  currently has "up" (`activeCardId`, defaults to their next unplayed card —
  changeable any time via a new `set_active_card` event, though the frontend
  doesn't need it since it just always shows your next card). A round now
  has one shared `stat` (the picker's choice), not two independent
  per-side picks. Win keeps the pick, tie holds it, loss flips it — identical
  rule to `docs/development/cpu-battle-rules.md`.
- **Server-enforced 30s turn timer** (`TURN_TIME_MS`) — a `setTimeout` set
  every time the picker changes (`startTurnTimer`), cleared the moment a real
  `submit_turn` arrives. If it fires first, the server itself auto-picks
  (the picker's next remaining card + a random stat that isn't quota-locked)
  and resolves the round exactly as if the player had submitted it — mirrors
  `BattleArena.tsx`'s `handleAutoPlay()`. Verified live: a throwaway two-
  socket test that deliberately never submitted confirmed the round resolved
  itself at the 30s mark with `autoPicked: true`.
- **New `turn_state` event** — `{ isYourTurn, pickerUsername, turnEndsAt,
roundNumber }`, emitted to both sides whenever the picker changes. Drives
  the frontend's "your pick" vs. "waiting for X to pick" UI and the
  synchronized countdown (both clients count down against the same
  `turnEndsAt` deadline rather than independently).
- **`frontend/src/screens/LivePvPArena.tsx`** — added a `timeLeft` countdown
  state and the same radial SVG timer ring `BattleArena.tsx` uses (`circumference`/
  `dashOffset` math, red under 10s), a client-side `handleAutoPlay()` that
  mirrors the server's (picks a random available card + unlocked stat) so the
  UI doesn't just sit frozen while the server's own timer is the real
  enforcement, per-stat lock icons (`Lock` from lucide-react, same as CPU
  battles) once a stat hits `MAX_STAT_USES_PER_MATCH`, and the card/stat
  picker is now only interactive on your own turn — otherwise it shows
  "Waiting for {opponent} to pick…".
- Removed the now-unused `opponent_locked_in` event and the old
  `RoundOutcomePayload` shape that carried two independent per-side stats;
  `round_outcome` now carries one shared `stat` plus `wasYourPick`/
  `autoPicked` flags.

**Verified live, two real socket connections against the running dev server

- real Supabase** (registered fresh accounts, read their ids straight back
  from Supabase since `join_battle` doesn't require a verified session):

* A full 5-round match (identical starter decks on both sides, so every
  round tied) played to completion — turn order correctly stayed with
  whichever side held the pick since every round tied ("tie holds"), hand
  replenishment kicked in correctly after each 3-card deck cycled, and the
  match ended as a draw at round 6 (`currentRound > MAX_ROUNDS`) exactly like
  the CPU ruleset.
* `applyMatchResult` ran for both sides — confirmed directly in Supabase
  afterward: `totalXP +50`, `essenceBalance +15`, `pvpDraws +1` on both
  accounts, two `battle_matches` rows (`matchType: 'LIVE_PVP'`,
  `winnerId: 'DRAW'`).
* A second test deliberately never submitted a pick: the server's own 30s
  timer fired, auto-picked, and resolved the round (`autoPicked: true` on the
  picker's own `round_outcome`, `false` on the opponent's, as expected).
* A stale repeat-pick attempt was correctly rejected with `turn_error`
  (caught this by accident — a bug in the _test script's_ own bookkeeping,
  not the product code, which already mirrors the server's hand-replenish
  reset correctly).
* `tsc --noEmit` clean on both packages; backend 23/23 and frontend 89/89
  tests still pass unchanged (no test coverage existed for the socket
  handler's old behavior to begin with — see "Testing plan" in the plan doc,
  Socket.IO code is smoke-tested manually by design in this codebase).

---

## Original implementation (2026-09-08, since revised above)

What actually got built for the "websocket version" — real-time PvP,
server-authoritative, no wagering (confirmed against the course brief —
trading is the brief's only card-exchange mechanic, and it's mutual/
voluntary, not tied to battle outcomes). Branch: `mahlatse/pvp` (off
`mahlatse/cpu-battle-rules`, so battle-hub navigation to Live PvP already
works). Implements the Live PvP half of
`personal/pvp-feature-implementation-plan.md` — async PvP and wiring
`AsyncPvP.tsx` are still separate, not done here.

## Backend

**New `backend/src/utils/battleResolution.ts`** — a pure port of the CPU
battle ruleset's comparison logic (category-edge bonus, attack blunted by
defense, per-stat quota, best-of-5/first-to-3), unit tested
(`battleResolution.test.ts`, 12 tests). Deliberately does **not** port the
no-repeat-card _hand-replenishment_ mechanic as a pure function — that's
handled statefully in the socket handler instead (see below), since it
needs to track per-player, per-match state the pure resolution functions
don't have access to.

**New `backend/src/services/deckService.ts`** — `getUserBattleDeck(userId)`
fetches a player's real default deck from Supabase (`user_decks` →
`cards` + `user_cards` bonuses, same stat computation
`GET /users/:id/cards` already used). The server never trusts a
client-supplied deck.

**New `backend/src/services/applyMatchResult.ts`** — extracted the
level-up/Elo/division/pvpWins-Losses-Draws/`battle_matches`-insert block
out of `battle.ts`'s `/record` handler so it's reusable, not rewritten a
second time for PvP. `battle.ts` now just calls it. One small adjacent fix
made here: the original code only incremented `pvpWins`/`pvpLosses`/
`pvpDraws` for `matchType === 'CPU'`, explicitly skipping real PvP types —
almost certainly a leftover from before PvP existed, since a field named
`pvpWins` skipping actual PvP results doesn't make sense. Now applies to
all match types.

**Rewritten `backend/src/services/battleSocketHandler.ts`** — was a stub
that broadcast both players' raw picks without ever deciding a round
winner (client-side comparison, not server-authoritative) and tracked a
`score` field that nothing ever incremented. Now:

- `join_battle` fetches the real deck server-side; a user with no saved
  deck gets a `join_error` instead of joining with fake data.
- Simultaneous secret picks (kept, not the async-PvP alternating-picker
  model — two players present at once don't have a natural "whose turn is
  it," so both submit before either is revealed). Each side is judged on
  **their own chosen stat** against the opponent's card on that same stat
  — if you pick attack and they pick speed, you're each compared on the
  attribute you picked. If both "win" their own comparison (different
  stats, both favorable) or both "lose," the round ties. Degrades cleanly
  to classic same-stat comparison when both sides happen to pick the same
  stat (the common case).
- Server-side enforcement: rejects a repeated card (`turn_error`) and a
  stat already picked twice this match (per-player quota, mirrors the CPU
  ruleset) — the client can't cheat by resubmitting.
- **Same hand-replenishment fix as the CPU-battle "no longer plays 5
  rounds" bug**: new accounts only start with 3 cards, not 5. Once a side's
  used every card in their deck, their hand replenishes (excluding
  whichever card was just played, so it can't repeat immediately) — a
  short deck can still sustain a full best-of-5 instead of stalling out.
- Match ends at first-to-3 or after 5 rounds, whichever comes first,
  calling `applyMatchResult` per player with an Elo-gap delta (standard
  expected-score formula, K=32) and flat XP/Essence (win 100/30, draw
  50/15, loss 20/0 — your call to retune, picked reasonable round numbers).
- **Reconnect**: a disconnect doesn't end the match immediately — the room
  stays alive for 60s, and a fresh `join_battle` with the same
  `matchId`+`userId` within that window resumes them (their locked-in pick
  for the in-flight round, if any, is preserved). No reconnect within 60s
  → the match is forfeited to the opponent.

**No matchmaking system** — `frontend`'s `LOBBY_MATCH_ID` is a single
shared lobby constant; the first two people to open Live PvP at the same
time get paired (a third becomes a spectator via the existing room-capacity
logic). This makes "two people online at once can actually play" true
today, which is what was asked for, but it's not real matchmaking (no
queueing, no picking a specific opponent, no multiple concurrent matches) —
that's separate future work (ranked matchmaking is already tracked as F19).

## Frontend

**`frontend/src/utils/websocketClient.ts`** — the socket URL was hardcoded
to `localhost:3000` (F11); now reads `VITE_API_URL` like the rest of the
app. `submitTurn`'s signature dropped `cardName`/`statVal` params — the
server looks those up itself now, never trusts client-supplied values.

**`frontend/src/screens/LivePvPArena.tsx`** — fully rewritten, all mock
state removed. Connects on mount, joins the shared lobby, and drives its
UI entirely off server events: `battle_start` (real deck), `round_outcome`
(reveal + score), `battle_end` (result + rewards, merged into
`currentUser` via `updateUserLocally`), plus connection-status UI for
`player_disconnected`/`player_reconnected` and inline error display for
`turn_error`/`join_error`. Player picks a card from their remaining hand,
then a stat — same two-step interaction CPU battles already use.

One real bug caught by testing against the live server (see below): the
socket event listeners are registered once per mount, so their closures
saw `yourDeck` as it was at mount time (empty), not after `battle_start`
populated it — classic stale-closure trap. Fixed by mirroring the deck (and
used-card tracking) in `useRef`s that the listeners read fresh, alongside
the `useState` versions React actually renders from.

## Verified live, end to end, two real socket connections

Registered two fresh test accounts, wrote a throwaway two-player smoke-test
script (`socket.io-client`, deleted after use — not committed), and ran it
against the actual running dev backend + real Supabase:

- Real decks fetched correctly for both sides.
- Round resolution, category-edge bonus, and the "judged on your own stat"
  rule all correct.
- No-repeat-card and per-stat-quota enforcement both fired real
  `turn_error`s when deliberately violated, and the client retried
  successfully.
- Hand replenishment kicked in after each 3-card starter deck cycled once,
  letting the match continue to its full 5 rounds instead of stalling.
- A killed connection correctly triggered the 60s grace timer; when it
  expired (across two separate test runs), the opponent was declared the
  winner by forfeit, `applyMatchResult` ran, and the reward posted for
  real — confirmed by querying Supabase directly afterward (`eloRating`,
  `totalXP`, `essenceBalance`, `pvpWins`/`pvpDraws` all updated correctly,
  `battle_matches` rows present with `matchType: 'LIVE_PVP'`).
- A completed 5-round draw match produced correctly _asymmetric_ Elo
  deltas for the two sides (+1 / -1) — expected, not a bug: their ratings
  had already diverged slightly from the earlier forfeit, and a draw
  between unequally-rated players nudges the lower-rated side up and the
  higher-rated side down under the standard Elo formula.

## Also verified

- `tsc --noEmit` clean on both packages.
- Backend: 23/23 tests passing (12 new for `battleResolution.ts`).
- Frontend: 89/89 passing (one existing test's assertion text updated to
  match the renamed screen title), coverage gate holds.
- Both production builds succeed.

## What's explicitly out of scope here

- Async PvP backend and wiring `AsyncPvP.tsx` — separate, not started.
- Real matchmaking (queueing, opponent choice, multiple concurrent
  matches) — the shared-lobby approach is a deliberate stopgap.
- Card wagering — confirmed against the brief this isn't wanted; matches
  just decide a winner (Elo/XP/Essence/history), same as the brief
  describes.
