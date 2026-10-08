# Game Overview

## Concept

A lecturer wanted to replace static campus tours with something students would actually want to do. **Wits Quest** takes the _Pokémon GO_ formula — go somewhere real, get rewarded — and combines it with a _Top Trumps_-style turn-based card battle game, themed entirely around Wits: its alumni, history, landmarks, and trivia.

The loop is simple to state and hard to cheat:

1. A player approaches a real campus landmark (e.g. _Great Hall_, _Solomon Mahlangu House_, _Science Stadium_, _Cullen Library_, _Origins Centre_).
2. Once within range, a trivia challenge about that landmark unlocks.
3. A correct answer awards a collectible card tied to that location, once per player.
4. Cards are collected, built into decks, and used to battle the CPU or other students in a turn-based, attribute-comparison combat system.

The location claim from a player's device is never trusted outright — it's treated as a claim to be verified, which is the core integrity problem the geolocation and anti-cheat systems exist to solve.

## Features

Every feature is listed by area on [Core Features](core-features.md), and by the sprint it was built in on [Features by Sprint](sprint-features.md).

## Delivery tiers

The brief is explicitly staged into three tiers of increasing difficulty. See [Requirements](requirements.md) for the full breakdown of what each tier demands.

| Tier         | Theme                                                                                                                                  |
| :----------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| Basic        | Core loop: map, geofenced trivia, cards, CPU battles, authoring console                                                                |
| Intermediate | Offline resilience, harder location verification, async PvP, progression/social systems, curation workflow                             |
| Advanced     | Live PvP, adaptive anti-cheat/trust scoring, procedural event placement, ranked seasons, territory control, trading, analytics console |

Who owns which part of the game is on the [Scope](scope.md#who-owns-what) page.
