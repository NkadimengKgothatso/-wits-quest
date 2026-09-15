# Motivation

Why Wits Quest exists, why it works the way it does, and why the team cares — the human story behind the technical decisions.

---

## The problem we set out to solve

A lecturer told us something obvious once we stopped to think about it: **campus tours don't work**. First-year students are marched past the Great Hall, the Origins Centre, and the Cullen Library in week one — and by October most couldn't tell you what any of them are. Wits has over a century of history (founded 1922), remarkable alumni, and landmark buildings that students walk past daily without ever learning about.

The knowledge is there. The engagement isn't.

## Why a location-based game

*Pokémon GO* already proved the formula at global scale: **go somewhere real, get rewarded**. Millions of people happily walked further than usual because a game asked them to. We took that proven loop and pointed it at a problem on our own campus:

1. Walk to a real Wits landmark.
2. The game unlocks a trivia challenge about that place.
3. Answer correctly, earn a collectible card tied to the location.
4. Build decks from those cards and battle other students.

Players explore the campus because they *want* the reward — and absorb its history as a side effect. That's the trick: **the learning is smuggled in inside the fun**.

## Why card battles

The battle system is deliberately *Top Trumps*-simple — turn-based, attribute-by-attribute comparison (ATK / DEF / SPD / BRN) — because it had to work on a phone, outdoors, in short bursts between lectures. Simplicity on the surface hides depth underneath: card rarity, deck construction under budget constraints, streak multipliers, Elo-ranked divisions, and async/live PvP give competitive players plenty to optimise.

## Why integrity is the backbone

A location game lives or dies on one question: *can you fake being there?* If players could answer trivia from their couch, the whole concept would collapse — the exploration **is** the game. That's why "trust nothing from the client" became the architectural backbone: location claims, answers, and battle outcomes are verified server-side. Trusting the phone would have been far easier to build — and would have made the game meaningless. (The concrete defects this guards against are catalogued in [Fix Register F1–F6](../development/fix-register.md).)

## Why the Wits theme

We could have themed the cards around generic fantasy. We chose Wits itself — its alumni, history, and landmarks — because a game about *your own campus* hits differently: you walk past the very building you just earned a card about. Pride in the institution is part of the motivation loop.

## What we want players to feel

- **"I never knew that about my campus."** — history absorbed accidentally, one card at a time.
- **"Let me just get to the library and unlock this one."** — students walking more, outdoors, between classes.
- **"Rematch."** — genuine social competition with classmates through leaderboards, divisions, and PvP.

Our first user feedback already shows this landing — one player called the reward-and-leaderboard loop *"very addictive"* and praised the campus exploration ([User Feedback](user-feedback.md)).

## Motivation behind the technical choices

The stack serves this motivation, not the other way around. The personal, team-specific reasons for each choice — React, Node, Supabase over its competitors, Leaflet over paid map APIs, why the backend enforces the rules — are documented in [Technical Decisions](../development/technical-decisions.md). The process rules that protect the vision (integrity before features, finish before new) are in [Methodology](methodology.md).
