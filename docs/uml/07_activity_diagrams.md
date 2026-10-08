# Activity Diagrams

The decisions the server makes, step by step, for the game's trickiest checks. Each one follows the real code, so the order of the checks matches what happens.

---

## Checking a player was really at an event

Runs every time a player answers an event's trivia (`verifyPresence` in `backend/src/utils/presence.ts`). The app sends the GPS fix it took when the player answered: position, accuracy and time.

```mermaid
flowchart TD
    Start([Player submits an answer with a GPS fix]) --> A{Is there a position?}
    A -- No --> Stale[Refuse: turn on location]
    A -- Yes --> B{Is the fix recent?<br/>2 min, or 24 h if it was<br/>queued while offline}
    B -- No --> Stale2[Refuse: reading too old]
    B -- Yes --> C{Was the event running<br/>at that time?}
    C -- No --> NotActive[Refuse: event not running]
    C -- Yes --> D{GPS accuracy worse than 100 m<br/>AND the player scanned this<br/>event's QR code recently?}
    D -- Yes --> OK1([Accept: verified by QR code])
    D -- No --> E{Inside the event's radius?<br/>radius + GPS accuracy}
    E -- No --> Far[Refuse: you're X m away]
    E -- Yes --> F{GPS accuracy worse than 100 m?}
    F -- Yes --> Proof[Ask for proof: scan the QR code]
    F -- No --> G{Does it match the player's<br/>own recent location pings?}
    G -- No --> Mismatch[Refuse: doesn't match where<br/>your device has been]
    G -- Yes --> OK2([Accept: verified at the event])
```

## Checking each location ping for cheating

Runs on every location ping the app sends while the game is open (`evaluatePing` in `backend/src/utils/antiCheat.ts`). Flags don't block the player straight away. They lower the player's trust score, which admins review.

```mermaid
flowchart TD
    Start([App sends a location ping]) --> Save[Save ping to telemetry_pings]
    Save --> A{Accuracy worse than 100 m?}
    A -- Yes --> Poor[Flag: poor_accuracy] --> End([Done])
    A -- No --> B{Is there an earlier ping<br/>with good accuracy?}
    B -- No --> End
    B -- Yes --> C[Work out distance, time<br/>and speed between the two]
    C --> D{Moved 200 m or more<br/>in 5 seconds or less?}
    D -- Yes --> Tele[Flag: teleport] --> End
    D -- No --> E{Moved 30 m or more, faster<br/>than 15 m/s, about 54 km/h?}
    E -- Yes --> Speed[Flag: speed] --> End
    E -- No --> End
```

Small jumps (under 30 m, or within the GPS accuracy) are ignored, because a phone standing still reports positions a few metres apart.

## Finding a ranked opponent

Runs when a player joins the ranked queue, and again every 10 seconds for everyone waiting (`backend/src/services/battleSocketHandler.ts`).

```mermaid
flowchart TD
    Start([Player taps Find ranked match]) --> A{Connected to the lobby?}
    A -- No --> E1[Error: connect first]
    A -- Yes --> B{Already in a match?}
    B -- Yes --> E2[Error: finish your match first]
    B -- No --> C{Trust score 40 or more?}
    C -- No --> E3[Error: trust score too low]
    C -- Yes --> Q[Join the queue with current Elo]
    Q --> P{Another player in the queue<br/>within 150 Elo?}
    P -- Yes --> M([Start a live match for both])
    P -- No --> W{Waited over 60 seconds?}
    W -- Yes --> Wide[Widen the range to 300 Elo] --> Retry
    W -- No --> Retry[Try again in 10 seconds]
    Retry --> P
```

After the match, both players' Elo changes and their division is worked out again (see [Database Plan](../database/database-plan.md#divisions)).
