# Sequence Diagrams

Step by step, what happens between the app, the API and the database for the game's main actions. Every request after login carries the player's Supabase token, and the API works out who the player is from the token, never from the request body.

---

## Sign up

```mermaid
sequenceDiagram
    actor P as Player
    participant App as App (React)
    participant Auth as Supabase Auth
    participant API as API (Express)
    participant DB as Database

    P->>App: Enter Wits email, username, password
    App->>App: Check email is 7 digits @students.wits.ac.za
    App->>Auth: signUp(email, password)
    Auth-->>P: Email with a verification code
    P->>App: Enter the code
    App->>Auth: verifyOtp(email, code)
    Auth-->>App: Session token
    App->>API: POST /api/auth/complete-signup (token)
    API->>Auth: Check token
    Auth-->>API: User id
    API->>DB: Insert users row (level 1, Elo 1000, 100 Essence)
    API->>DB: Insert starter cards into user_cards
    API->>DB: Insert default deck into user_decks
    API-->>App: 201 Created, player profile
    App-->>P: Show the campus map
```

## Answer an event's trivia

The most important flow for fairness: the server decides whether the player was really there and whether the answer is right.

```mermaid
sequenceDiagram
    actor P as Player
    participant App as App (React)
    participant Q as Offline queue (IndexedDB)
    participant API as API (Express)
    participant DB as Database

    P->>App: Open an event on the map
    App->>API: GET /api/events/:id/trivia
    API-->>App: Question and options (no answer)
    P->>App: Choose an answer
    App->>API: POST /api/events/:id/answer (answer, GPS fix, accuracy, time)

    alt No connection
        App->>Q: Save the answer with its GPS fix
        Note over App,Q: Sent again when the phone is back online
    end

    API->>DB: Already answered this event?
    alt Already answered
        API-->>App: 409 Already answered
    end
    API->>DB: Load event
    API->>API: verifyPresence (inside radius, event active, fix recent, matches telemetry)
    alt Not there, or GPS too weak and no QR check-in
        API-->>App: 403 with the reason
    end
    API->>API: Check answer against correctAnswer
    API->>DB: Insert user_trivia_attempts
    alt Wrong
        API-->>App: Wrong, plus the right answer
    else Right
        API->>DB: Insert event_attempts
        API->>DB: Update streak, add XP and Essence
        API->>DB: Give the event's card
        API->>DB: Check and unlock achievements
        API->>DB: rpc add_territory_influence
        API-->>App: Right, plus rewards, card, achievements, territory
    end
    App-->>P: Show the result
```

## Live PvP round

Live battles use Socket.IO. The server holds the match and decides every round.

```mermaid
sequenceDiagram
    actor A as Picker
    actor B as Responder
    participant S as API (Socket.IO)
    participant DB as Database

    A->>S: lobby:challenge (B)
    S->>B: lobby:challenge_received
    B->>S: lobby:challenge_response (accept)
    S->>A: lobby:challenge_accepted
    S->>B: lobby:challenge_accepted
    A->>S: join_battle
    B->>S: join_battle
    S->>DB: Load both players' default decks
    S->>A: battle_start
    S->>B: battle_start

    loop Each round (until 3 wins or 5 rounds)
        S->>A: turn_state (your pick, 30 s)
        A->>S: submit_turn (card, stat)
        S->>S: Check card is in deck, not used, stat used under 2 times
        S->>B: turn_state (respond to this stat, 30 s)
        B->>S: respond_turn (card)
        S->>S: resolveRound (compare the stat)
        S->>A: round_outcome
        S->>B: round_outcome
        Note over A,B: The picker swaps for the next round
    end

    S->>DB: Save battle_matches, update Elo, XP, Essence
    S->>A: battle_end
    S->>B: battle_end
```

If a turn's 30 seconds run out, the server picks for that player. If a player disconnects for more than 60 seconds, the other player wins.

## Trade cards

```mermaid
sequenceDiagram
    actor S as Sender
    actor R as Receiver
    participant API as API (Express)
    participant DB as Database

    S->>API: POST /api/trades (receiver, cards to give, cards wanted)
    API->>DB: Check accounts are 7+ days old, not suspended, under the daily limit
    API->>DB: Check each player owns the cards they put in, and the values are close enough
    API->>DB: rpc create_trade_offer (expires in 24 h)
    API-->>S: 201 Offer created

    R->>API: GET /api/trades
    API-->>R: Offers sent to me
    R->>API: POST /api/trades/:id/accept
    API->>DB: rpc accept_trade_offer
    Note over DB: One locked step: checks the offer is pending and not expired, both accounts are 7+ days old and not suspended, under 5 trades today, and both still have the cards. Then swaps the cards.
    DB-->>API: Done, or the reason it failed
    API-->>R: Trade complete, or 400 with the reason
```

## Upgrade a card in the Forge

```mermaid
sequenceDiagram
    actor P as Player
    participant App as App (React)
    participant API as API (Express)
    participant DB as Database

    P->>App: Tap Upgrade on a card
    App->>API: POST /api/forge/upgrade (inventory id)
    API->>DB: rpc forge_upgrade(inventory id, player id)
    Note over DB: Locks the player and the card. Needs 100 Essence and 3+ copies. Takes 100 Essence and 2 copies, adds 1 level and +5 to every stat.
    DB-->>API: New level and Essence, or an error
    API-->>App: Result
    App-->>P: Show the upgraded card
```
