# Remaining Tasks — Implementation Plan

Sprint 2, Mahlatse — everything still outstanding after CPU battle rules and
real streaks: **Battle hub, PvP (async + live), Offline answers.** Plan for
review — nothing implemented. Each feature area gets its own branch when we
start it (per the one-branch-per-feature rule), off `main`.

Battle hub already has a full plan written earlier in the sprint,
summarized below with a pointer. PvP (async backend, wiring the screen,
and live) has been pulled into its own dedicated plan,
`personal/pvp-feature-implementation-plan.md`, since those three are really
one feature. Offline answers is new. Everything's been re-checked against
current reality (in particular: the Supabase mockDb fallback no longer
exists — you had me revert it — so anywhere an old plan mentioned it,
that's corrected here).

---

## 1. Battle hub

**Full plan already written**: `battle-hub-implementation-plan.md`,
committed on `mahlatse/cpu-battle-rules` (not on this branch — that's where
the battle rules work lives). Summary: extend `BattleArena.tsx`'s existing
internal `mode` state to `'hub' | 'ai' | 'async' | 'live'`, render
`AsyncPvP`/`LivePvPArena` inline (same pattern the CPU-match mode already
uses) instead of the `alert("Multiplayer is coming soon!")`, add an
optional `onBack` prop to both screens. Small, mechanical, no open
questions — this is the quickest win of the five and unblocks nothing else
depending on it, so it's a reasonable one to just start with.

No changes to that plan. Branch: `mahlatse/battle-hub`.

---

## 2–4. Async PvP backend, wire the screen, Live PvP

**Pulled out into its own dedicated plan**:
`personal/pvp-feature-implementation-plan.md` — you asked for these three
to be planned separately since they're really one feature (turn-based and
real-time are two delivery modes of the same thing), not three unrelated
tasks. One branch (`mahlatse/pvp`) covers all three instead of the
`mahlatse/async-pvp-backend` / `mahlatse/live-pvp` split originally
sketched here. That doc also proposes sharing the reward/level-up logic
across CPU, async, and live matches instead of writing it a third time.

Its 7 open questions replace the ones originally listed here (the
Supabase-only persistence update below is folded into that doc too).

---

## 5. Offline answers

New plan. This one has a real design gap worth flagging before I build the
wrong thing: `frontend/src/services/offlineQueue.ts` already exists and is
fully built (IndexedDB, `enqueueCheckIn`/`processQueue`/etc.) — but it's
wired to the **wrong endpoint for what TriviaModal actually does**.

- `offlineQueue.ts` queues `{userId, landmarkId, cardId, answer, timestamp}`
  and syncs by POSTing to `/api/trivia/checkin` — a route that **awards a
  card directly, with no grading at all** (checks if you already own the
  card, adds it if not).
- `TriviaModal.tsx`'s actual live flow is graded: `submitEventAnswer` →
  `/api/events/:id/answer`, which checks `selectedIndex`/`textAnswer`
  against the correct answer server-side and only awards anything if
  you're right. The correct answer is deliberately withheld from the
  client ("Answers are withheld from the GET response to prevent
  client-side cheating" — an explicit design note in the DB schema docs).

Those are two different mental models, and only one of them matches how the
app is actually graded. **I'd adapt `offlineQueue.ts` to queue the real
submission shape** (`eventId`, `selectedIndex`/`textAnswer`, the position
captured at answer time per the handover text, `timestamp`) and have
`processQueue()` POST each queued item to `/api/events/:id/answer` instead
— so grading (and any card reward) happens for real when the queue syncs,
not optimistically while still offline. This matches "the answer waits on
the phone and sends itself when the signal comes back" from the handover
guide more literally than the existing wiring would.

**Bigger open question — how much of "offline" are we actually solving?**
The handover text says _"a player inside a building with no signal can
still open an event they've reached and answer it"_ — that implies the
trivia **question itself** needs to be viewable offline too, not just the
answer submittable. Two real options:

- **(Recommended, smaller) Queue-on-submit-failure only.** Assumes the
  trivia question was already successfully loaded (you had signal when you
  approached the landmark, then lost it, or you're mid-building with a weak
  signal that loaded the question but won't hold for the POST). If
  `submitEventAnswer` throws a network error, queue it instead of just
  showing `submitError`, show an "offline — will sync" badge, and register
  a `window.addEventListener('online', ...)` to flush the queue. Doesn't
  help someone who was never online at all near that landmark.
- **(Fuller, more work) Pre-cache trivia for nearby/active events.** Cache
  each event's trivia question (in `localStorage`, keyed by event id) the
  moment it's successfully fetched anywhere in the app, so `TriviaModal`
  can fall back to the cached copy if the live fetch fails. Actually
  matches the literal handover scenario (walked into a building with zero
  signal, never got a chance to fetch anything fresh) but is meaningfully
  more surface area — cache invalidation, staleness if a question changes
  server-side, deciding which events get pre-cached and when.

I'd start with the smaller option and treat the pre-cache version as a
follow-up if it turns out people actually hit the fully-offline case in
practice, rather than building the bigger thing speculatively — but this is
a real product decision, not just an implementation detail, so it's yours
to make.

Branch: `mahlatse/offline-answers`.

---

## Suggested order

1. **Battle hub** — quickest, no dependencies, no open questions.
2. **PvP feature** (async backend + screen + live) — see its own plan for
   internal sequencing (async before live, since live can reuse what async
   establishes).
3. **Offline answers** — fully independent of the other two, could be done
   first or last with no difference either way.

## What I need from you

- Confirm the Battle hub plan as-is (no changes since it was written).
- Review `personal/pvp-feature-implementation-plan.md` separately — its 7
  open questions.
- For Offline answers: confirm the smaller "queue on submit failure" scope,
  or say you want the fuller pre-caching version.
- Confirm the suggested order, or tell me where you'd rather start.
