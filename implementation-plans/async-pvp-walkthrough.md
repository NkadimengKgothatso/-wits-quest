# Async PvP — Walkthrough

## 2026-09-11 revision: real ruleset parity + full arena UI

Direct feedback after the first pass: "the gameplay of this challenges
should be the same with the kudu challenge... all rules apply everywhere
you just mimic the UI on kudu computer challenge for every challenge when
in play but it is now people playing." Two real gaps, fixed:

**1. Card selection wasn't actually the same rule as CPU/Live.** The
original version picked each side's card automatically via
`deckIds[(roundNumber-1) % deckLength]` — simple round-robin, not a real
hand. Replaced with the _actual_ no-repeat-until-exhausted rule CPU
battles and Live PvP use: `deriveUsedCardIds()` replays `roundsHistory` to
work out which of a side's cards are currently "spent," and the whole hand
only replenishes (excluding whatever was just played) once every card's
been used — same as `battleEngine.ts`'s `resolveRound` and
`battleSocketHandler.ts`'s `resolveTurn`. The picker now genuinely chooses
**which card** to play (`POST /:id/play-turn` takes `{ cardId, stat }`,
not just `{ stat }`), same two-step interaction as CPU/Live. The
non-picker's card — since async's opponent isn't online to react in real
time — defaults to their own next available card (`nextAvailableCard()`),
which is exactly Live PvP's own fallback for a player who hasn't actively
changed their selection.

**2. The UI was a small compact modal, not an arena.** Replaced with a new
full-screen `frontend/src/screens/AsyncBattleArena.tsx`, deliberately
modeled on `BattleArena.tsx`'s actual CPU-match screen — same design
tokens (`var(--color-bg)`, `var(--color-card-bg)`, etc., not the PvP
screens' own hardcoded ambers), same layout: scoreboard with round pips,
avatar standings row (real chosen avatars, both sides), a category-edge
⚡ callout, side-by-side YOUR CARD / OPPONENT CARD panels with a win/lose/
tie overlay icon, a 2×2 attribute grid with padlock icons for
quota-exhausted stats, and a hand strip with padlock icons for
already-used cards and a "X cards left" caption. The one deliberate,
named difference: **no 30-second countdown** — async gives you as long as
you need on your turn (the only clock is the 24h overall-match expiry,
already enforced server-side); Live PvP keeps its timer because both
sides really are online at once there.

**Backend response shape changes to support this:**

- `GET /:id` now returns `yourDeck` (full resolved cards) and
  `usedCardIds` instead of a single computed `yourCard` — the frontend
  needs the whole hand to render the strip and let you pick, not just
  "whichever card round-robin would have picked."
- `POST /:id/play-turn` requires `cardId` now, validates it's actually in
  your deck and not currently used, and its response is reshaped from
  _your_ perspective (`yourCardName`/`opponentStatVal`/`outcome`/
  `categoryEdge: 'you'|'opponent'|null`) instead of the raw
  challenger-perspective storage shape — the arena UI shouldn't have to
  know or care which async role you are to render "you vs them."
- `finishChallenge()` now returns each side's own `{result, xp, essence,
eloChange}` so the play-turn response can include a live `matchEnd`
  object for whoever's action just ended the match (mirrors CPU/Live's
  end-of-match reward screen) — the other player only finds out next time
  they open the match, same honest scope boundary as before.

New tests: `deriveUsedCardIds` and `nextAvailableCard` in
`asyncChallengeState.test.ts` (6 more, 14 total for that file). Re-verified
live against the real backend + Supabase: card ownership/reuse validation,
a full match played by genuinely selecting cards + stats each round
(3-card starter decks correctly cycling with replenish, matching the CPU/
Live behavior this was built to match), and reward persistence.

---

## Original implementation (2026-09-10)

What actually got built for Domain 2 task 2.3, and for the direct request
to clean up `AsyncPvP.tsx`'s hardcoded demo data ("Thabo Nkosi", "Lerato
Dlamini", etc. — never wired to anything real) and make the full lifecycle
work: browse registered students -> send a challenge -> it sits queued
until accepted -> once accepted both sides can play turn-based, not
needing to be online at the same time. Branch: `mahlatse/pvp` (same branch
as Live PvP — one feature area, per the branching workflow). Implements
the Async half of `personal/pvp-feature-implementation-plan.md`.

## Backend

**New `backend/src/routes/asyncBattle.ts`**, mounted at
`/api/battle/async`, every route behind `authMiddleware`:

- `GET /opponents` — every other student (public fields only — id,
  username, level, eloRating, divisionTier, avatar), for the "who do you
  want to challenge" picker.
- `GET /my-matches` — the four buckets `AsyncPvP.tsx` shows: **Your Turn**
  (it's your pick), **Waiting** (mid-match but not your pick, or a
  challenge you sent that's still awaiting their response), **Challenges**
  (incoming invites to accept/decline), **History** (completed/expired/
  declined). Lazy-expires any stale challenge as part of the read (see
  below) so the buckets are always current without a scheduled sweep.
- `GET /:id` — full detail for the "Play Turn" view. Only reveals **your**
  current card and which stats you can still pick (quota-aware) if it's
  actually your turn — the opponent's card for the round in progress is
  never sent, same as every other battle mode; it only shows up in
  `roundsHistory` once the round resolves.
- `POST /challenge` — `{ defenderId }`. Snapshots both sides' current
  default-deck card ids (not full stats — those get resolved fresh on
  every later read, in case a card's level/bonuses change mid-match),
  `expiresAt` = +24h, status `PENDING_ACCEPTANCE`. Rejects a duplicate
  active challenge between the same two people in either direction.
- `POST /:id/accept` / `POST /:id/decline` — defender only. Accept flips to
  `CHALLENGER_TURN` (challenger picks round 1).
- `POST /:id/play-turn` — `{ stat }`. The client **only ever sends the
  stat** — never a card, never a claimed result. Only the side whose turn
  it is can call this; the server resolves both sides' cards itself and
  decides the round via `battleResolution.ts` (the same module Live PvP
  already ported from the CPU engine). Same turn-order rule everywhere in
  the app: win keeps the pick, tie holds it, loss flips it. On the round
  that decides the match (first to 3, or 5 rounds played), calls the
  shared `applyMatchResult` helper for both sides and marks the challenge
  `COMPLETED`.

**Whose turn it is, and each side's per-stat quota, are never stored as
separate columns** — `backend/src/utils/asyncChallengeState.ts`
(`deriveAsyncTurnState`) derives both purely from the challenge's
`roundsHistory` array on every read: round 1's picker is always the
challenger, then the same win/tie/loss rule walks forward through the
history. One less place for stored state to drift from what actually
happened. 8 unit tests (`asyncChallengeState.test.ts`).

**How a round resolves an opponent's card without them being present**:
Live PvP has a persistent "active card" a player sets themselves; CPU
battles have an AI that reactively counters. Neither model fits async —
nobody's online to react in real time. Instead, each side's deck (snapshot
taken at challenge creation) is played **in fixed order, cycling**:
`deckIds[(roundNumber - 1) % deckIds.length]`. This was a live decision,
not something the original plan pinned down — and it deliberately avoids
the exact bug class that hit CPU battles and Live PvP earlier this sprint
("best of 3, not 5" because new accounts only start with 3 cards): modulo
cycling sustains a full 5-round match on any deck length ≥ 2, with no
immediate repeats (consecutive rounds always land on different indices).

**24h expiry — lazy-checked, not a scheduled sweep**, per the plan's
recommendation. `expireIfNeeded()` runs on every read
(`my-matches`/`:id`/`accept`/`decline`/`play-turn`): a lapsed invite
(never accepted) just expires with no forfeit; a match that was
**underway** forfeits to whoever wasn't the one stuck holding the pick —
same `applyMatchResult` reward path as a natural finish, just with
terminal status `EXPIRED` instead of `COMPLETED`.

**Shared with Live PvP**: extracted `backend/src/utils/matchRewards.ts`
(`REWARDS` table, `eloDelta`) out of `battleSocketHandler.ts` so Live and
Async pay out identically instead of drifting — both are backend files, no
frontend/backend split blocking the extraction this time (unlike
`battleResolution.ts`, which genuinely has to be duplicated across the
package boundary).

**Also fixed while in here**: `GET /api/users` and `GET /api/users/:id`
were returning **every column, including `passwordHash`**, to any caller
— never actually used by any frontend code before this feature (confirmed
via grep), so no prior real-world exposure, but the new opponent picker
was about to become the first real caller. Narrowed both to an explicit
public-column list. Did **not** touch the several other `select('*')`
calls on `users` elsewhere in `auth.ts` (login, `/me`, profile updates,
etc.) — those return a user's own row to themselves, a different and much
larger cleanup outside what was actually asked here.

**Deleted `backend/src/services/mockDb.ts`** — a fully orphaned in-memory
fallback DB (zero real imports anywhere, confirmed by grep, including
tests) left over from before the Supabase-only revert earlier this sprint.
It was blocking a clean type-check once `ChallengeStatus` gained new
values (`mockDb.ts` still used the old 3-value enum) — rather than patch
a dead file, deleted it, consistent with "remove any fallback or reference
to local memory."

**`backend/src/services/deckService.ts`** — added `getBattleCardsByIds`
(resolve specific card ids to full stats for a user) and
`getUserDefaultDeckCardIds` (just the id list, for snapshotting a
challenge), refactoring `getUserBattleDeck` to share the stat-resolution
logic instead of duplicating it a third time.

**`backend/src/models/schema.ts`** — `ChallengeStatus` extended from the
original 3-value stub (`PENDING_DEFENDER_TURN | COMPLETED | EXPIRED`,
never actually reachable from any code) to the 6-value lifecycle above.

## Frontend

**`frontend/src/services/apiClient.ts`** — replaced three dead stub
functions (`getMockAsyncChallenges`/`updateMockAsyncChallenge`/
`createMockAsyncChallenge`, all no-ops that returned `[]`/`undefined`/
`null` and were never called from anywhere) with real client functions
calling the endpoints above: `getAsyncOpponents`, `getMyAsyncMatches`,
`getAsyncChallengeDetail`, `sendAsyncChallenge`, `acceptAsyncChallenge`,
`declineAsyncChallenge`, `playAsyncTurn`.

**`frontend/src/screens/AsyncPvP.tsx`** — fully rewritten, all hardcoded
demo arrays removed:

- A **"Challenge" button** opens a **Find Opponent modal** — every
  registered student, search-filterable, one tap to send a challenge.
- The four tabs (**Your Turn** / **Waiting** / **Challenges** /
  **History**) are driven entirely by `GET /my-matches`, refreshed on
  mount and every 20s. Async PvP has no socket/push channel of its own
  (that's Live PvP's transport) — polling is the closest thing to a live
  "alert" this screen can do when someone else sends or accepts a
  challenge; a manual pull-to-refresh isn't needed since it self-refreshes,
  but there's no instant push either. Flagged as a known limitation, not
  silently glossed over.
- **Accept/Decline** buttons on incoming challenges call the real
  endpoints and refresh the list.
- A **Play Turn modal** (same pattern `TriviaModal.tsx` already uses over
  `MapExplorer` — self-contained, no new route) shows your current card
  and lets you pick a stat (locked out, with a padlock icon, once a stat
  hits its 2-per-match quota — same visual language as CPU/Live battles);
  submitting shows the round result, then closes back to a refreshed list.

## Verified live, end to end, against the running dev backend + real Supabase

Two throwaway smoke-test scripts (registered fresh accounts, read their
ids back from Supabase, called every endpoint with real JWTs — deleted
after use, not committed):

**Script 1 — full happy path**: `passwordHash` confirmed absent from both
`/users` and `/opponents`; opponent correctly appears in the browse list;
challenge created; a duplicate challenge between the same two people
correctly rejected (409); challenger sees it under Waiting, defender under
Challenges; accept flips to `CHALLENGER_TURN` and it moves to the
challenger's Your Turn bucket; played a full 5-round match alternating
whoever's turn it actually was (both accounts had identical starter
decks, so every round tied — correctly held the pick with the challenger
the whole match, exactly matching the "tie holds" rule); match completed,
`applyMatchResult` ran for both sides (confirmed directly in Supabase:
`totalXP +50`, `essenceBalance +15`, `pvpDraws +1` on both accounts, two
`battle_matches` rows with `matchType: 'ASYNC_PVP'`); a play-turn attempt
from the side whose turn it _wasn't_ correctly rejected (409).

**Script 2 — decline and expiry**: decline correctly moves a challenge to
`DECLINED` and into the declining side's opponent's History with
`result: 'declined'`; accepting an already-declined challenge correctly
rejected (409); backdating a mid-match challenge's `expiresAt` into the
past and then reading it correctly lazy-expired it to `EXPIRED` and
awarded the forfeit win to whoever wasn't stuck holding the pick
(confirmed via `pvpWins` incrementing on the right account); backdating a
never-accepted challenge's `expiresAt` correctly lazy-expired it to
`EXPIRED` with no forfeit.

## Also verified

- `tsc --noEmit` clean on both packages.
- Backend: 31/31 tests passing (8 new for `asyncChallengeState.ts`).
- Frontend: 88/88 passing (unchanged — `AsyncPvP.tsx` isn't in the
  coverage `include` allowlist in `vite.config.ts`, same as
  `LivePvPArena.tsx`; this codebase already treats screens with
  socket/async-heavy live interaction as smoke-tested manually rather than
  unit-tested, and this follows that same established pattern).

## What's explicitly out of scope here

- `defensiveTelemetry` generation for the match loser — the schema field
  exists but nothing populates it; there's no existing telemetry-generation
  helper to call into, and it wasn't part of what was actually asked for.
- Real push notifications for a new/accepted challenge — 20s polling is the
  substitute; a real push channel would need infrastructure this app
  doesn't have yet.
- A scheduled expiry sweep — lazy-checked only, per the plan's
  recommendation; correct as long as something eventually reads the
  challenge, which the 20s poll guarantees while the screen is open.
- The other `select('*')` calls on `users` in `auth.ts` (login, `/me`,
  profile updates) still return `passwordHash` to the same authenticated
  user — narrower blast radius than the opponent-list leak this fixed, and
  a separate cleanup from what was asked here.
