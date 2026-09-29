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

### Sprint 2 — Core Features

- **Card Creation** — implemented the creation and management of collectible cards.
- **Event Curation** — implemented tools for creating and curating location-based events.
- **Online Players** — added visibility of players currently online.
- **Leaderboard** — added player rankings to encourage competition.
- **Battle Page** — implemented a live, multiplayer battle interface for real-time card battles.

### Sprint 3 — Core Features

- **Location Check-ins** — implemented server-side location and time validation to ensure players are within the required event area and time window when answering questions.
- **Offline Check-ins** — implemented support for queued answers by storing the player's location and submission time for server-side validation.
- **Server-Side Battles** — moved battle logic to the server so that the server determines battle rounds, winners and rewards.
- **Live Battle Spectating** — added the ability for players to watch ongoing live battles.
- **Anti-Cheat Checks** — implemented walking-time validation, duplicate-answer detection and trust-based checks to identify suspicious gameplay.
- **QR Location Verification** — added QR-code verification as an alternative when GPS accuracy is insufficient.
- **Trading** — implemented secure card trading with transaction-based swaps and restrictions to prevent card funneling.
- **Quest Trails** — implemented ordered event trails that players must complete sequentially to receive a completion reward.
- **Mobile & Accessibility Improvements** — improved the application for mobile devices and accessibility, including responsive layouts, touch targets, semantic HTML and ARIA support.
- **Content Review Workflow** — implemented a draft, review and publish workflow requiring approval from a second administrator.
- **Campaign Management** — implemented campaigns with configurable start and end dates, allowing events to automatically become active and retire.
- **Needs Repair Questions** — implemented question-performance monitoring to identify questions with unusually low pass rates for review and repair.
- **Real Campus Content** — populated the production database with real campus events, questions and collectible card content.
- **API Improvements** — standardised API methods, routes, status codes and error responses, while introducing API versioning under `/api/v1`.
- **API Performance Optimisation** — identified and improved slow database queries and analytics endpoints.
- **Security Improvements** — strengthened API security through CORS restrictions, authentication checks and protection of public endpoints.
- **Next Stop & Walking Directions** — implemented navigation to the nearest active event or next trail step using an external walking-route service with caching and fallback behaviour.
- **Automated Testing & CI** — expanded API and UI test coverage and introduced CI checks to monitor test coverage and prevent regressions.
- **Admin-Created Achievements** — implemented an admin system for creating achievements based on player progress, including cards collected, battles won, levels reached, events completed, streaks and completed trails.
- **Achievement Unlocks** — implemented automatic server-side achievement checking and an in-game popup when players unlock achievements.
- **Analytics** — added analytics for question pass rates and card drop rates compared with their intended rarity rates.
- **Streaks & XP Multipliers** — implemented consecutive-day streak tracking, including XP multipliers for 3-day and 7-day streaks.



## Delivery tiers

The brief is explicitly staged into three tiers of increasing difficulty. See [Requirements](requirements.md) for the full breakdown of what each tier demands.

| Tier         | Theme                                                                                                                                  |
| :----------- | :------------------------------------------------------------------------------------------------------------------------------------- |
| Basic        | Core loop: map, geofenced trivia, cards, CPU battles, authoring console                                                                |
| Intermediate | Offline resilience, harder location verification, async PvP, progression/social systems, curation workflow                             |
| Advanced     | Live PvP, adaptive anti-cheat/trust scoring, procedural event placement, ranked seasons, territory control, trading, analytics console |

## Team ownership

Each of the six team members owns a domain end-to-end (screens + backing logic). See [Architecture](../development/architecture.md) for the full feature-to-owner mapping.
