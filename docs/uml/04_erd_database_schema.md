# Entity Relationship Diagram (ERD)

How the database tables link to each other. To keep the diagrams readable, each table shows only its key and link columns; every column is listed on [Database Schema](../database/database-schema.md).

**How to read the lines:** `||--o{` means "one to many" (one player owns many cards). `||--o|` means "one to zero or one".

---

## The whole database

Every table and every column in one picture, with each link drawn as an arrow to the table it points to. Click it to open it full size and zoom in.

[![The full Wits Quest database: 27 tables in 8 groups](../database/images/database-diagram.svg)](../database/images/database-diagram.svg)

[Download as PNG](../database/images/database-diagram.png)

The diagrams below show the same links split into three smaller pictures.

---

## Players, cards, events and battles

```mermaid
erDiagram
    USERS ||--o{ USER_CARDS : owns
    CARDS ||--o{ USER_CARDS : "copy of"
    USERS ||--o{ USER_DECKS : builds
    CARDS |o--o{ EVENTS : "given by"
    CAMPAIGNS |o--o{ EVENTS : schedules
    EVENTS ||--o{ TRIVIA_QUESTIONS : asks
    USERS ||--o{ EVENT_ATTEMPTS : completes
    EVENTS ||--o{ EVENT_ATTEMPTS : "completed in"
    USERS ||--o{ USER_TRIVIA_ATTEMPTS : answers
    TRIVIA_QUESTIONS ||--o{ USER_TRIVIA_ATTEMPTS : "answered in"
    USERS ||--o{ BATTLE_MATCHES : challenges
    USERS ||--o{ ASYNC_PVP_CHALLENGES : "challenges or defends"

    USERS {
        uuid id PK
        text username
        text role
        int eloRating
        int essenceBalance
        int maxStatBudget
    }
    CARDS {
        text id PK
        text rarity
        text status
    }
    USER_CARDS {
        text id PK
        uuid userId FK
        text cardId FK
        int level
        int quantity
    }
    USER_DECKS {
        text id PK
        uuid userId FK
        jsonb cardIds
        boolean isDefault
    }
    CAMPAIGNS {
        text id PK
        timestamptz startDate
        timestamptz endDate
    }
    EVENTS {
        text id PK
        text cardReward FK
        text campaignId FK
        float lat
        float lng
        int radius
        text status
    }
    TRIVIA_QUESTIONS {
        text id PK
        text eventId FK
        text questionType
        text status
    }
    EVENT_ATTEMPTS {
        text id PK
        uuid userId FK
        text eventId FK
    }
    USER_TRIVIA_ATTEMPTS {
        text id PK
        uuid userId FK
        text triviaId FK
        boolean isCorrect
    }
    BATTLE_MATCHES {
        text id PK
        uuid challengerId FK
        text opponentId
        text winnerId
        text matchType
    }
    ASYNC_PVP_CHALLENGES {
        text id PK
        uuid challengerId FK
        uuid defenderId FK
        text status
    }
```

`battle_matches.opponentId` and `winnerId` are not links, because they can also hold `CPU_BOT` or `DRAW`.

## Trading, trails, territory and seasons

```mermaid
erDiagram
    USERS ||--o{ TRADE_OFFERS : "sends or receives"
    TRADE_OFFERS ||--|{ TRADE_OFFER_ITEMS : contains
    USER_CARDS ||--o{ TRADE_OFFER_ITEMS : "offered in"
    QUEST_TRAILS ||--|{ QUEST_TRAIL_STEPS : "made of"
    EVENTS ||--o{ QUEST_TRAIL_STEPS : "step of"
    CARDS |o--o{ QUEST_TRAILS : "bonus card"
    USERS ||--o{ USER_QUEST_PROGRESS : follows
    QUEST_TRAILS ||--o{ USER_QUEST_PROGRESS : "followed in"
    USERS |o--o{ TERRITORIES : owns
    TERRITORIES ||--o{ TERRITORY_INFLUENCE : "influence in"
    USERS ||--o{ TERRITORY_INFLUENCE : builds
    SEASONS ||--o{ SEASON_SNAPSHOTS : "final ranks"
    USERS ||--o{ SEASON_SNAPSHOTS : "ranked in"

    TRADE_OFFERS {
        uuid id PK
        uuid sender_id FK
        uuid receiver_id FK
        text status
        timestamptz expires_at
    }
    TRADE_OFFER_ITEMS {
        uuid id PK
        uuid trade_id FK
        uuid user_id FK
        text user_card_id FK
        int quantity
    }
    QUEST_TRAILS {
        text id PK
        text rewardCardId FK
        text status
    }
    QUEST_TRAIL_STEPS {
        text id PK
        text trailId FK
        text eventId FK
        int orderIndex
    }
    USER_QUEST_PROGRESS {
        text id PK
        uuid userId FK
        text trailId FK
        int currentStep
    }
    TERRITORIES {
        text id PK
        uuid owner_id FK
        int capture_count
    }
    TERRITORY_INFLUENCE {
        text territory_id PK
        uuid user_id PK
        int influence
    }
    SEASONS {
        text id PK
        boolean is_active
    }
    SEASON_SNAPSHOTS {
        text season_id PK
        uuid user_id PK
        int final_elo
        int rank
    }
```

## Anti-cheat and achievements

```mermaid
erDiagram
    USERS ||--o{ TELEMETRY_PINGS : sends
    TELEMETRY_PINGS |o--o{ TELEMETRY_FLAGS : "caused"
    USERS ||--o{ TELEMETRY_FLAGS : "flagged in"
    USERS ||--o{ TELEMETRY_AUDIT : "reviewed in"
    USERS ||--o{ TRUST_TIER_HISTORY : "tier changes"
    USERS ||--o{ USER_ACHIEVEMENTS : unlocks
    ACHIEVEMENTS ||--o{ USER_ACHIEVEMENTS : "unlocked as"

    TELEMETRY_PINGS {
        bigint id PK
        uuid user_id FK
        float lat
        float lng
        float accuracy
    }
    TELEMETRY_FLAGS {
        text id PK
        uuid user_id FK
        bigint ping_id FK
        text flag_type
    }
    TELEMETRY_AUDIT {
        text id PK
        uuid user_id FK
        text action
    }
    TRUST_TIER_HISTORY {
        text id PK
        uuid user_id FK
        text old_tier
        text new_tier
    }
    ACHIEVEMENTS {
        text id PK
        text rule_type
        int target_value
        boolean active
    }
    USER_ACHIEVEMENTS {
        text id PK
        uuid user_id FK
        text achievement_id FK
    }
```

`avatars` stands alone: `users.avatar` holds an avatar id, but the database doesn't enforce the link.
