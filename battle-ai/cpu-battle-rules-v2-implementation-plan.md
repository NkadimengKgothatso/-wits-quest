# CPU Battle Rules v2 — Implementation Plan (Proposals)

Sprint 2, Mahlatse — extends `docs/development/cpu-battle-rules.md` (merged)
and `personal/battle-balance-implementation-plan.md` (options A + E merged;
B/C/D still proposals).

**Status (2026-09-09): implemented.** Idea 1 confirmed already done (reading
A). Idea 2 built as the per-stat quota (reading b). Idea 3 built as Variant B
(defense mitigates attack). See `personal/cpu-battle-rules-v2-walkthrough.md`
for what actually changed, and `docs/development/cpu-battle-rules.md`
sections 5–7 for the merged rulebook.

Your message packed three separate rule ideas into one sentence — I've split
them out below, and for the two that are genuinely ambiguous as written, I'm
giving you the readings I can see rather than guessing and building the
wrong one.

## Idea 1 — "card reusing should not work" / "use card not consecutively in that 5 match"

These two phrases pull in different directions, so which one do you actually
want?

- **Reading A — full ban (already done).** `mahlatse/cpu-battle-rules`
  (option A, merged) already removes a card from a side's hand the instant
  it's played — a card can be used **at most once, period**, for the whole
  match. This is strictly stronger than "not consecutively." If this is
  what you meant, there's nothing new to build here.
- **Reading B — reuse allowed, just not back-to-back.** A weaker rule: the
  same card _can_ come back later in the match, it just can't be played two
  rounds in a row. This is a genuinely different rule from what's merged,
  and would need option A's hard removal-from-hand loosened to a
  one-round cooldown instead.

My read of "reusing should not work" is Reading A, and I think "not
consecutively" is you describing the _effect_ of that rule in your own
words (once a card's gone, it obviously can't come up next round or any
round after) rather than asking for the weaker version. **If that's right,
this idea needs no new code** — flagging it so we don't rebuild something
that already shipped. Tell me if you actually meant Reading B.

## Idea 2 — "you can't use more than 2 features on a card once"

Three ways I can read "features" here:

- **(a) Per-card stat-use cap.** No single _card_ gets more than 2 of its
  stats "used" (picked as the comparison stat) in the match. Given a card
  can only be played once at all now (idea 1, reading A), it can only ever
  be compared on **one** stat per use — this cap is already unreachable to
  violate. Doesn't apply if reading A stands.
- **(b) Per-stat quota across the match (my best guess at your intent).**
  No single _stat_ — attack, defense, speed, or brains — can be picked as
  the comparison stat more than **2 times total** across the whole match,
  regardless of which card it's on. This is a real, new constraint,
  stricter than the existing "no-repeat-stat" idea from the original
  battle-balance plan (option B, not yet built) which only banned picking
  the same stat _twice in a row_ — this would cap it at 2 uses for the
  _entire match_, forcing real stat diversity across 5 rounds (e.g. you
  could go attack, attack, defense, speed, brains, but not
  attack×3 or attack,defense,attack,defense,attack).
- **(c) Static card-design cap.** No single _card_ is allowed to have more
  than 2 stats above some "strong" threshold (e.g. no card has 3+ stats
  over 80) — a deck/card-catalog balance rule enforced at card-authoring or
  deck-validation time, not a runtime battle rule at all.

**My recommendation: (b), a per-stat quota of 2 uses per match.** It's the
reading that best matches "use ... a [feature] ... once" as an in-match
action, it's a natural tightening of the no-repeat-stat idea from the
original plan, and it's straightforward to implement and test (track a
per-side `Record<StatAttribute, number>` use-count in `BattleState`, reject
a pick — or disable that stat's button — once its side hits 2). (c) is a
plausible alternate reading but is a different kind of rule (card design,
not match rules) — flag if that's actually what you want instead.

## Idea 3 — "if they played different options like attack vs defence there should be some ruling"

This is the most consequential of the three — it reads as wanting an
**asymmetric stat matchup** (attack vs. defense being compared against each
other, not attack vs. attack), which is a different comparison model from
what's built. Two ways to do it, at very different levels of invasiveness:

- **Variant A — replace same-stat comparison with fixed pairings.** Attack
  is always compared against the _opponent's Defense_ (not their Attack);
  Speed vs. Brains similarly cross-compared (a plausible second pairing —
  reflexes vs. cunning). This throws out the current "both sides reveal the
  same stat" Top-Trumps model entirely and replaces it with a fixed
  strength/weakness table. Biggest change of the three ideas here: touches
  `resolveRound`'s core comparison, the category-edge bonus (which currently
  assumes "your stat vs. their same stat" — would need rethinking for which
  side's category applies to which stat), the picker's stat-choice meaning
  ("pick attack" now means "attack my opponent's defense," a different
  mental model for the player), and every existing round-resolution test.
- **Variant B — defense mitigates attack, everything else unchanged.** Keep
  the existing same-stat comparison as the baseline (attack vs. attack,
  defense vs. defense, etc. — no change to the mental model, no test
  breakage for the other three stats). Add one specific interaction: when
  the compared stat is **attack**, the defending side's own **defense**
  stat blunts it — e.g. effective attack value = `attack − defense × 0.3`
  (floored at some minimum) before the win/lose comparison. This is a much
  smaller, additive change: one new rule for one specific stat pairing,
  everything else in the engine (category edge, no-repeat cards, picker
  flip) keeps working exactly as tested.

**My recommendation: Variant B**, specifically because it's additive rather
than a redesign — it gives you the "attack vs. defense means something"
result you're asking for without touching the three other stats' behavior
or invalidating what's already shipped and tested. Variant A is a
legitimately more thematic combat system, but it's a much bigger,
higher-risk change for this point in the sprint (redefines what "pick a
stat" means for the player, and needs a full re-think of how the category
bonus interacts with it) — I'd treat it as a "maybe later, if we have time"
rather than doing it now, unless you specifically want that bigger version.

## How these three interact, if you take my recommendations

- Idea 1: no change (already shipped as option A).
- Idea 2(b): per-stat quota of 2, tracked in `BattleState`.
- Idea 3 (Variant B): attack's effective value gets reduced by 30% of the
  defender's defense stat before comparison; category edge still applies to
  the (now-mitigated) attack value the same way it already does to any
  stat.

None of these conflict with each other or with the already-merged picker
flip / no-repeat-cards / category-edge / payout rules — they'd all layer
into the same `resolveRound` function in `battleEngine.ts`.

## Where this would land in code (once confirmed)

- `frontend/src/utils/battleEngine.ts` — add per-side stat-use counts to
  `BattleState`, enforce the quota in `resolveRound` (and probably expose a
  helper so the UI can grey out an exhausted stat), add the attack/defense
  mitigation step before the category-edge bonus is applied.
- `frontend/src/screens/BattleArena.tsx` — disable a stat button once its
  side has used it twice; maybe a small "2/2 used" indicator per stat.
- `docs/development/cpu-battle-rules.md` — update the merged rulebook once
  this lands, same as last time.
- Tests: extend `frontend/src/utils/battleEngine.test.ts` — quota
  enforcement (3rd pick of the same stat rejected or ignored — need to
  decide the exact mechanic, see open question below), and the attack/defense
  mitigation math.

## One implementation detail I need your call on for idea 2

What happens when a player **tries** to pick a stat they've already used
twice? Two options:

- The stat button is simply disabled/hidden once exhausted (player never
  gets to attempt an invalid pick) — cleanest, matches how the picker UI
  already disables things.
- `resolveRound` rejects it and the caller must handle "invalid pick" —
  more defensive, needed if this ever becomes server-authoritative (e.g.
  for the async PvP work), but more to build right now for no benefit while
  everything's still client-only.

I'd default to the first (UI just disables it) unless you want the engine
itself to be the enforcement point.

## What I need from you

- Confirm idea 1 is already done (Reading A), or tell me you actually want
  Reading B.
- Confirm idea 2 is the per-stat quota of 2 (reading b), or one of the other
  readings.
- Pick Variant A or B for idea 3 (or say "skip idea 3 for now").
