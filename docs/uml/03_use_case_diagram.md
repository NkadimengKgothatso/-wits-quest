# Use Case Diagram

What each kind of user can do in Wits Quest. There are two roles with different powers: **players** (role `STUDENT`) and **admins** (role `ADMIN`). The `LECTURER` role exists in the database, but it has no extra powers yet, so lecturers use the game like players.

Some actions are blocked for players with a low trust score (see [Anti-cheat](#notes)).

```mermaid
flowchart LR
    Player(["👤 Player"])
    Admin(["👤 Admin"])
    Supa(["⚙️ Supabase Auth"])
    ORS(["⚙️ OpenRouteService"])

    subgraph Account
        UA1["Sign up with a Wits email"]
        UA2["Log in"]
        UA3["Choose an avatar"]
        UA4["Delete my account"]
    end

    subgraph Explore ["Explore campus"]
        UE1["View the campus map and events"]
        UE2["Get walking directions"]
        UE3["Check in at an event (GPS or QR code)"]
        UE4["Answer an event's trivia"]
        UE5["Follow a quest trail"]
        UE6["Capture territory"]
        UE7["Keep a daily streak"]
    end

    subgraph Cards
        UC1["View my card collection"]
        UC2["Build a 5-card deck"]
        UC3["Scrap or upgrade cards in the Forge"]
        UC4["Trade cards with another player"]
    end

    subgraph Battle
        UB1["Battle the CPU"]
        UB2["Challenge a player live"]
        UB3["Play an async challenge"]
        UB4["Queue for a ranked match"]
        UB5["Watch a live match"]
        UB6["View battle history"]
    end

    subgraph Progress
        UP1["View the leaderboard"]
        UP2["Unlock achievements"]
    end

    subgraph Manage ["Manage the game"]
        UM1["Create and edit events, trivia and cards"]
        UM2["Review and publish content"]
        UM3["Schedule campaigns"]
        UM4["Generate an event QR code"]
        UM5["Create quest trails and achievements"]
        UM6["Review anti-cheat flags and warn or suspend"]
        UM7["View analytics"]
        UM8["End a ranked season"]
    end

    Player --- UA1 & UA2 & UA3 & UA4
    Player --- UE1 & UE2 & UE3 & UE4 & UE5 & UE6 & UE7
    Player --- UC1 & UC2 & UC3 & UC4
    Player --- UB1 & UB2 & UB3 & UB4 & UB5 & UB6
    Player --- UP1 & UP2

    Admin --- UM1 & UM2 & UM3 & UM4 & UM5 & UM6 & UM7 & UM8

    UA1 --- Supa
    UA2 --- Supa
    UE2 --- ORS
```

## Notes

- **An admin is also a player.** Admins can do everything a player can, plus the "Manage the game" actions. An admin can't see the admin screens unless their role is `ADMIN`.
- **Answering trivia includes checking in.** The server only accepts an answer if the player was really at the event. See the [answer sequence](06_sequence_diagrams.md#answer-an-events-trivia).
- **Capturing territory and keeping a streak happen automatically.** A correct answer counts toward the streak and adds influence in the zone around the event.
- **Anti-cheat limits some actions.** A player's trust score is worked out from their movement flags. Below 40 they can't play ranked. Below 20 they also can't play async challenges, and get no cards from the multi-question trivia route (`POST /api/trivia/answer`). The main event answer route doesn't check trust yet. A suspended player can't trade. (The trust rules also say players below 40 can't trade, but the trade endpoints don't check this yet.)
