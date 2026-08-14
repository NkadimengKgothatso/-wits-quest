# Technical Decisions

A running log of the significant technical choices behind Wits Quest and the reasoning for them. Add a new entry whenever a non-obvious decision is made, so future contributors don't have to reverse-engineer *why*.

## Delivery format: PWA, not native

**Decision**: Ship as a Progressive Web App rather than native iOS/Android apps.
**Why**: Students need to install nothing to try it, it works across platforms with one codebase, and it still supports the offline/service-worker requirements from the Intermediate tier.

## Location is a claim, not a fact

**Decision**: Every GPS report from the client is treated as unverified input, checked against distance thresholds and (at the Intermediate tier) movement history before being trusted.
**Why**: A card is only worth collecting if it had to be walked to — trusting client-reported GPS outright would let anyone spoof a location and defeat the entire premise of the game. See [Architecture § Map & Location](architecture.md#map--location) for the Haversine radius check, and Requirements → Intermediate for movement-history anti-spoofing.

## Server-authoritative trivia and combat

**Decision**: Trivia answers are marked server-side, and match rules (round resolution, XP/Essence awards) are enforced server-side — never trusted from the client.
**Why**: Same integrity principle as location — a player's device has every incentive to lie about winning.

## Offline-first check-ins

**Decision**: A trivia attempt made without connectivity is queued on-device (IndexedDB) via a service worker and reconciled against the backend once the connection returns, validated as if it happened at capture time.
**Why**: Campus buildings are a realistic dead zone for signal; the game shouldn't punish a student for being inside the Great Hall.

## Custom JWT auth (not a third-party provider)

**Decision**: Authentication is a custom JWT implementation rather than an off-the-shelf auth provider (Firebase, Auth0, etc.).
**Owner**: Member 3.
**Why**: Keeps the student-identity model (`studentNumber`, Wits email domain, `role` enum) fully under the team's control and avoids external dependency/cost for a course project — revisit if scope grows past the course deadline.

## Deck constraints as anti-power-creep

**Decision**: Decks are capped at exactly 5 cards, a 300-point total stat budget (scaling with player level), and at most 1 Legendary card.
**Why**: Prevents a high-level player from simply stacking 5 Legendaries and trivializing matchmaking; keeps early-game and late-game decks comparably competitive.

## Async PvP telemetry as a retention hook

**Decision**: A defeated async PvP defender receives `defenderTelemetry` — which stat attribute lost and by how much — rather than just a loss notification.
**Why**: Converts a loss into actionable feedback ("swap in a higher-SPD card"), which should reduce churn from players who lose PvP matches while offline.

## Trust scoring instead of binary bans (Advanced tier)

**Decision**: Anti-cheat responses should be proportionate (warnings, restrictions, flags for review) rather than an automatic ban on first detection, with genuinely suspicious cases routed to a human reviewer via `AdminAntiCheat.tsx`.
**Why**: The evidence (movement, submission timing, account pairing) comes entirely from a party that has a reason to lie — false positives from noisy GPS or coincidental account pairings are expected, so an instant-ban system would punish innocent players.

## Real-time match transport: WebSockets

**Decision**: Live PvP (`LivePvPArena.tsx`) uses WebSockets rather than polling.
**Owner**: Member 2.
**Why**: Turn timers, simultaneous state for both players, and spectating all need low-latency bidirectional updates that polling can't deliver cleanly.

---

*Add new entries above this line, most recent first, as decisions are made during development.*
