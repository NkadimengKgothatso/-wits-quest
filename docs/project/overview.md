# Project Overview

## Concept

A lecturer wanted to replace static campus tours with something students would actually want to do. **Wits Quest** takes the _Pokémon GO_ formula — go somewhere real, get rewarded — and combines it with a _Top Trumps_-style turn-based card battle game, themed entirely around Wits: its alumni, history, landmarks, and trivia.

The loop is simple to state and hard to cheat:

1. A player approaches a real campus landmark (e.g. _Great Hall_, _Solomon Mahlangu House_, _Science Stadium_, _Cullen Library_, _Origins Centre_).
2. Once within range, a trivia challenge about that landmark unlocks.
3. A correct answer awards a collectible card tied to that location, once per player.
4. Cards are collected, built into decks, and used to battle the CPU or other students in a turn-based, attribute-comparison combat system.

The location claim from a player's device is never trusted outright — it's treated as a claim to be verified, which is the core integrity problem the geolocation and anti-cheat systems exist to solve.

## Core systems

- **Map & Geolocation** — live campus map, landmark proximity detection (Haversine distance), in-range/out-of-range event states.
- **Trivia Engine** — location-gated questions drawn from Wits history/alumni/landmarks, marked server-side rather than on-device.
- **Card Collection** — cards carry a category and a set of battle attributes; rarity varies.
- **Combat** — 5-card decks, turn-based round-by-round attribute comparisons (ATK / DEF / SPD / BRN), enforced by the server.
- **Progression** — XP, levels, daily streaks with multipliers, Essence currency, card upgrading/scrapping.
- **Social & Competitive** — async and live PvP, trading, leaderboards, Elo-ranked seasons, campus territory control.
- **Authoring/Admin Console** — event placement, question/card authoring, curation review pipeline, anti-cheat review, analytics.

## Delivery tiers

The brief is explicitly staged into three tiers of increasing difficulty. See [Requirements](requirements.md) for the full breakdown of what each tier demands.

| Tier         | Theme                                                                                                                                  |
| :----------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| Basic        | Core loop: map, geofenced trivia, cards, CPU battles, authoring console                                                                |
| Intermediate | Offline resilience, harder location verification, async PvP, progression/social systems, curation workflow                             |
| Advanced     | Live PvP, adaptive anti-cheat/trust scoring, procedural event placement, ranked seasons, territory control, trading, analytics console |

## Team ownership

Each of the six team members owns a domain end-to-end (screens + backing logic). See [Architecture](../development/architecture.md) for the full feature-to-owner mapping.
