# Requirements

Requirements are organised exactly as they appear in the original project brief (COMS3011A, Project 6): **Basic**, **Intermediate**, and **Advanced** tiers of increasing difficulty and polish.

## Basic

- **Campus map**: player sees their own position and what's nearby.
- **Events**: sit at fixed locations, active within a radius and for a time window; a player can tell at a glance what's in reach, too far, or expired.
- **Location verification**: a device's reported position is a *claim*, not a fact — it must be checked before an event challenge can be attempted.
- **Trivia**: drawn from alumni, history, landmarks, or general university trivia; question format should vary; answers are marked server-side; the player learns the correct answer regardless of outcome.
- **Cards**: a correct answer awards the event's card exactly once. Cards carry a category and attributes, with varying rarity. Players can browse their collection.
- **Battles**: players choose a deck and play a turn-based match against the CPU, picking an attribute and comparing round by round. Match rules are enforced server-side. Finished matches are persisted.
- **Authoring console**: place events on the map, write questions/answers, define cards and their attribute values.

## Intermediate

- **Offline play**: a player without signal can still explore, open a reached event, and answer it. The attempt is held on-device and reconciled (checked as if it happened at the time) once connectivity returns.
- **Stronger location anti-spoofing**: consider movement history, not just the current claimed position — flag journeys that couldn't have been walked, attempts faster than physically possible, and low-accuracy fixes that need corroboration.
- **Async PvP**: players challenge each other and take turns on their own schedule; the game holds match state in between; an abandoned match eventually forfeits.
- **Retention systems**: profile, points, achievements, streaks, and campus-wide standings.
- **Card depth**: rarity tiers, meaningful duplicates (not dead weight), and decks built under constraints.
- **Quest trails**: events chained in a required order, with the game surfacing what's nearby and still unvisited.
- **Content curation**: draft → review → publish workflow (not instant-live), campaigns scheduled to terms/open days, retirement of old events, and surfacing of frequently-missed questions for repair.

## Advanced

- **Live PvP**: two players in the same match simultaneously, timed turns, server-authoritative state, reconnect support, and spectating.
- **Adaptive anti-cheat / trust scoring**: build a per-player trust picture over time from impossible movement, duplicate submissions, and suspicious account pairings (e.g. accounts that only ever play each other). Responses should be proportionate (not a single ban), with suspicious cases surfaced to a human reviewer on the console.
- **Procedural event placement**: distribute events automatically across walkable campus area, keep them spaced apart, cap how many are live at once, rotate them over time, and avoid permanently bare regions.
- **Ranked competitive play**: player ratings, skill-based matchmaking, and resettable seasons.
- **Territory control**: campus zones held/contested by many players acting concurrently, with server-resolved outcomes.
- **Trading**: two-sided offers with atomic (all-or-nothing) exchange, and limits to prevent using trades to funnel a collection into one account.
- **Analytics console**: which locations draw players and which don't, which questions are too easy, and whether card drop rates match intended targets.

## Non-functional themes across all tiers

- **Trust nothing from the client** — location, answers, and match outcomes are all server-verified.
- **Content lifecycle** — authoring evolves from direct publish (Basic) to full curation review (Intermediate).
- **Graceful degradation** — the game should remain playable in poor-connectivity conditions on a physical campus.
