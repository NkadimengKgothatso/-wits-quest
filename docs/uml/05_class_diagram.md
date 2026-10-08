# Class Diagram

Wits Quest is written in TypeScript as modules of functions rather than classes, so these diagrams show the **main types and the modules that work on them**. The first diagram is the game's domain model. The second shows how the backend code is organised.

---

## Domain model

The main things in the game, their key fields, and how they relate. Fields match the TypeScript types in `backend/src/models/schema.ts` and the database tables (see [Database Schema](../database/database-schema.md) for every column).

```mermaid
classDiagram
    direction LR

    class User {
        +uuid id
        +string email
        +string username
        +UserRole role
        +int level
        +int totalXP
        +int essenceBalance
        +int eloRating
        +DivisionTier divisionTier
        +int dailyStreakCount
        +int maxStatBudget
        +int legendaryCap
    }
    class UserRole {
        <<enumeration>>
        STUDENT
        ADMIN
        LECTURER
    }
    class Card {
        +string id
        +string name
        +Category category
        +Rarity rarity
        +int baseAttack
        +int baseDefense
        +int baseSpeed
        +int baseBrains
        +ContentStatus status
    }
    class Rarity {
        <<enumeration>>
        Common
        Rare
        Epic
        Legendary
    }
    class UserCard {
        +string id
        +int level
        +int quantity
        +int attackBonus
        +int defenseBonus
        +int speedBonus
        +int brainsBonus
    }
    class Deck {
        +string deckName
        +string[] cardIds
        +int totalStatCost
        +bool isDefault
    }
    class Event {
        +string id
        +float lat
        +float lng
        +int radius
        +int xpAward
        +int essenceAward
        +ContentStatus status
    }
    class TriviaQuestion {
        +string question
        +string questionType
        +string[] options
        -string correctAnswer
    }
    class Campaign {
        +string name
        +Date startDate
        +Date endDate
    }
    class BattleMatch {
        +MatchType matchType
        +string winnerId
        +int eloChange
        +int xpAwarded
        +RoundData[] roundsData
    }
    class AsyncChallenge {
        +ChallengeStatus status
        +int currentRound
        +int maxRounds
        +RoundData[] roundsHistory
        +Date expiresAt
    }
    class TradeOffer {
        +TradeStatus status
        +Date expiresAt
    }
    class TradeItem {
        +int quantity
    }
    class QuestTrail {
        +string name
        +int rewardXp
        +int rewardEssence
    }
    class Territory {
        +string name
        +float northLat
        +float southLat
        +float eastLng
        +float westLng
        +int captureCount
    }
    class Achievement {
        +string name
        +string ruleType
        +int targetValue
        +bool active
    }
    class TelemetryPing {
        +float lat
        +float lng
        +float accuracy
        +Date timestamp
    }
    class TelemetryFlag {
        +FlagType flagType
        +json details
    }

    User "1" --> "*" UserCard : owns
    UserCard "*" --> "1" Card : copy of
    User "1" --> "*" Deck : builds
    Deck "1" --> "5" Card : holds
    User --> UserRole
    Card --> Rarity
    Event "*" --> "0..1" Campaign : scheduled in
    Event "1" *-- "*" TriviaQuestion : asks
    Event "*" --> "0..1" Card : rewards
    User "1" --> "*" BattleMatch : challenger in
    AsyncChallenge "*" --> "2" User : challenger, defender
    TradeOffer "*" --> "2" User : sender, receiver
    TradeOffer "1" *-- "1..*" TradeItem : contains
    TradeItem "*" --> "1" UserCard : offers
    QuestTrail "*" o-- "*" Event : steps, in order
    QuestTrail "*" --> "0..1" Card : bonus card
    Territory "*" --> "0..1" User : owned by
    User "*" --> "*" Achievement : unlocks
    User "1" --> "*" TelemetryPing : sends
    TelemetryPing "1" --> "*" TelemetryFlag : may raise
```

`correctAnswer` is marked private (`-`) because the API never sends it to the app.

## Backend structure

How a request moves through the backend code. **Routes** check the login and the input, **services and utils** hold the game rules, and only the **Supabase client** talks to the database. The rules are kept in plain functions with no database calls where possible, so they can be unit tested on their own.

```mermaid
classDiagram
    direction TB

    class Server {
        <<server.ts>>
        +Express app
        +Socket.IO io
        +mount(routes)
    }
    class AuthMiddleware {
        <<middleware/auth.ts>>
        +authMiddleware(req) userId
        +requireAdmin(req)
    }
    class TrustGate {
        <<middleware/trustGate.ts>>
        +trustGate(action)
    }

    class Routes {
        <<routes/*>>
        auth, content, battle, asyncBattle
        trades, forge, trails, territory
        ranked, telemetry, qrCheckin, routing
    }

    class BattleSocketHandler {
        <<services/battleSocketHandler.ts>>
        -activeRooms
        -rankedQueue
        +setupBattleSocketHandler(io)
        +pairRankedQueue(io)
    }
    class ApplyMatchResult {
        <<services/applyMatchResult.ts>>
        +applyMatchResult(input)
        +calculateDivisionTier(elo)
    }
    class DeckService {
        <<services/deckService.ts>>
        +getUserBattleDeck(userId)
        +checkDeckBudget(cards, limits)
    }
    class EventPlacementService {
        <<services/eventPlacementService.ts>>
        +rotateEvents(force)
        +startEventRotationScheduler()
    }

    class BattleResolution {
        <<utils/battleResolution.ts>>
        +resolveRound(cardA, cardB, stat)
        +canUseStat(counts, stat)
        +isMatchDecided(aWins, bWins)
    }
    class CpuBattle {
        <<utils/cpuBattle.ts>>
        +createMatch()
        +playRound()
        +calculateRewards(match)
    }
    class AsyncChallengeState {
        <<utils/asyncChallengeState.ts>>
        +deriveAsyncTurnState()
        +nextAvailableCard()
    }
    class Presence {
        <<utils/presence.ts>>
        +verifyPresence(claim, event)
    }
    class AntiCheat {
        <<utils/antiCheat.ts>>
        +evaluatePing(current, previous)
        +minWalkingTime(a, b)
    }
    class Streak {
        <<utils/streak.ts>>
        +touchStreak(userId)
    }
    class Achievements {
        <<utils/achievements.ts>>
        +checkAndAwardAchievements(userId)
    }
    class SupabaseClient {
        <<db/supabaseClient.ts>>
        +from(table)
        +rpc(function)
        +auth.getUser(token)
    }

    Server --> AuthMiddleware
    Server --> Routes
    Server --> BattleSocketHandler
    Routes --> TrustGate
    Routes --> CpuBattle
    Routes --> AsyncChallengeState
    Routes --> Presence
    Routes --> AntiCheat
    Routes --> Streak
    Routes --> Achievements
    Routes --> DeckService
    Routes --> ApplyMatchResult
    BattleSocketHandler --> BattleResolution
    BattleSocketHandler --> DeckService
    BattleSocketHandler --> ApplyMatchResult
    CpuBattle --> BattleResolution
    AsyncChallengeState --> BattleResolution
    Server --> EventPlacementService
    Routes --> SupabaseClient
    BattleSocketHandler --> SupabaseClient
    ApplyMatchResult --> SupabaseClient
    DeckService --> SupabaseClient
    Presence --> SupabaseClient
    AuthMiddleware --> SupabaseClient
```

The app (frontend) follows the same idea: screens in `screens/` call `services/apiClient.ts` for HTTP and `utils/websocketClient.ts` for live battles, and never talk to the database directly.
