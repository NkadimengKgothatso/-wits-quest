# Database Plan

This page covers the relational database architecture for Wits Quest: how student registrations, progressive XP leveling, Essence currency, card inventories, custom decks, match history, and async PvP defensive telemetry are structured and persisted. For the full column-by-column table specifications, see [Database Schema](database-schema.md).

## Entity Relationship Diagram

```mermaid
erDiagram
    USERS ||--o{ USER_CARDS : "owns"
    USERS ||--o{ USER_DECKS : "configures"
    USERS ||--o{ BATTLE_MATCHES : "participates in"
    USERS ||--o{ ASYNC_CHALLENGES : "challenges/defends"
    CARDS ||--o{ USER_CARDS : "instantiates"

    USERS {
        string id PK
        string email
        string studentNumber
        string username
        string passwordHash
        string role
        int level
        int currentXP
        int totalXP
        int essenceBalance
        int dailyStreakCount
        string lastCheckInDate
        float streakMultiplier
        int eloRating
        string divisionTier
        int pvpWins
        int pvpLosses
        int maxStatBudget
    }

    CARDS {
        string id PK
        string name
        string category
        string rarity
        int baseAttack
        int baseDefense
        int baseSpeed
        int baseBrains
        int totalStats
        string imageUrl
    }

    USER_CARDS {
        string id PK
        string userId FK
        string cardId FK
        int level
        int attackBonus
        int defenseBonus
        int speedBonus
        int brainsBonus
        int quantity
    }

    USER_DECKS {
        string id PK
        string userId FK
        string deckName
        json cardIds
        int totalStatCost
        boolean isDefault
    }

    BATTLE_MATCHES {
        string id PK
        string matchType
        string challengerId FK
        string opponentId FK
        string winnerId
        int xpAwarded
        int essenceAwarded
        int eloChange
        json roundsData
    }

    ASYNC_CHALLENGES {
        string id PK
        string challengerId FK
        string defenderId FK
        string status
        int currentRound
        json defenderTelemetry
        datetime expiresAt
    }
```


## Student registration seeding workflow

After a new player signs up with Supabase Auth, the app calls `POST /api/auth/complete-signup`, which:

1. **Insert into `users`** — creates the player's profile: level 1, Elo 1000, 100 Essence and a deck stat budget of 2000.
2. **Insert into `user_cards`** — assigns 5 starter landmark cards to the student's inventory.
3. **Insert into `user_decks`** — builds a starter 5-card deck from those cards.

## Division tier calculation

Ranked division tiers are computed dynamically from `user.eloRating`:

| Division | Elo Range   |
| :------- | :---------- |
| Bronze   | 0 – 499     |
| Silver   | 500 – 999   |
| Gold     | 1000 – 1499 |
| Platinum | 1500 – 1799 |
| Diamond  | 1800+       |

