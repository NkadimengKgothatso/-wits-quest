# Database Schema

Every table in the Wits Quest database, what it stores, and its main columns. The database is PostgreSQL on Supabase. For why it's built this way, see [Database Plan](database-plan.md). For a picture of the whole database, see the [ERD](../uml/04_erd_database_schema.md#the-whole-database).

There are **27 tables** in eight groups:

| Group | Tables |
| :--- | :--- |
| [Players and cards](#players-and-cards) | `users`, `avatars`, `cards`, `user_cards`, `user_decks` |
| [Events and trivia](#events-and-trivia) | `campaigns`, `events`, `event_attempts`, `trivia_questions`, `user_trivia_attempts` |
| [Battles](#battles) | `battle_matches`, `async_pvp_challenges` |
| [Trading](#trading) | `trade_offers`, `trade_offer_items` |
| [Quest trails and territory](#quest-trails-and-territory) | `quest_trails`, `quest_trail_steps`, `user_quest_progress`, `territories`, `territory_influence` |
| [Ranked seasons](#ranked-seasons) | `seasons`, `season_snapshots` |
| [Anti-cheat](#anti-cheat) | `telemetry_pings`, `telemetry_flags`, `telemetry_audit`, `trust_tier_history` |
| [Achievements](#achievements) | `achievements`, `user_achievements` |

**How to read the tables below**

- Column names in `camelCase` are written in quotes in SQL (for example `"eloRating"`), because the backend sends them exactly like that. The anti-cheat, achievement, season, territory and trading tables use `snake_case` instead.
- **PK** is the primary key, **FK** is a link to another table, and **unique** means no two rows can share that value.
- Most ids are text (for example `card-008`). Player ids are the `uuid` that Supabase Auth gives each account.
- Unless it says otherwise, deleting a player also deletes their rows in every other table.

---

## Players and cards

### `users`

One row per player. The `id` is the player's Supabase Auth account id, so passwords and logins are handled by Supabase Auth, not this table.

| Column | Type | Default | What it holds |
| :--- | :--- | :--- | :--- |
| `id` | uuid | | PK, FK to `auth.users` |
| `email` | text | | Wits email, unique |
| `studentNumber` | text | | Student number, unique |
| `username` | text | | Display name |
| `role` | text | `STUDENT` | `STUDENT`, `ADMIN` or `LECTURER` |
| `isOnline` | boolean | false | Shown in the live PvP lobby |
| `level` | integer | 1 | Player level |
| `currentXP` / `totalXP` | integer | 0 | XP in this level / XP ever earned |
| `essenceBalance` | integer | 100 | Essence, spent in the Card Forge |
| `dailyStreakCount` | integer | 1 | Days in a row the player checked in |
| `lastCheckInDate` | timestamptz | now | Last daily check-in |
| `streakMultiplier` | float | 1.0 | XP bonus from the streak |
| `eloRating` | integer | 1000 | Ranked rating |
| `divisionTier` | text | `GOLD` | Bronze, Silver, Gold, Platinum or Diamond |
| `pvpWins` / `pvpLosses` / `pvpDraws` | integer | 0 | PvP record |
| `maxStatBudget` | integer | 2000 | Most stat points a deck may cost |
| `legendaryCap` | integer | 1 | Most Legendary cards allowed in a deck |
| `avatar` | text | `owl` | Chosen avatar (an `avatars` id) |
| `lastAction` / `lastActionAt` | text / timestamptz | | Last thing the player did, for the admin view |
| `createdAt` / `updatedAt` | timestamptz | now | When the account was made / last changed |

### `avatars`

The avatars players can pick from: `id`, `emoji`, `label`, and optional `cssClass` and `description`.

### `cards`

The master list of every card in the game.

| Column | Type | What it holds |
| :--- | :--- | :--- |
| `id` | text | PK, for example `card-008` |
| `name` | text | Card name |
| `category` | text | Science, History, Landmarks, Lifestyle or Sports |
| `rarity` | text | Common, Rare, Epic or Legendary |
| `baseAttack`, `baseDefense`, `baseSpeed`, `baseBrains` | integer | The four battle stats |
| `totalStats` | integer | Sum of the four stats (counts toward the deck budget) |
| `imageUrl` | text | Card picture (Supabase Storage) |
| `landmarkId` | text | The campus landmark it belongs to (optional) |
| `status` | text | `draft`, `review`, `published` or `retired` (default `published`) |
| `reviewRequestedBy` / `reviewRequestedAt` | text / timestamptz | Which admin sent it for review, and when |

Players only see `published` cards. A `retired` card is hidden from the catalogue, but players who own it keep it.

### `user_cards`

The cards each player owns (their inventory). One row per player per card.

| Column | Type | What it holds |
| :--- | :--- | :--- |
| `id` | text | PK |
| `userId` | uuid | FK to `users` |
| `cardId` | text | FK to `cards` |
| `level` | integer | Card level, raised in the Forge (default 1) |
| `attackBonus`, `defenseBonus`, `speedBonus`, `brainsBonus` | integer | Extra stats from Forge upgrades (default 0) |
| `quantity` | integer | How many copies the player has (default 1) |
| `acquiredAt` | timestamptz | When they got it |

### `user_decks`

Saved battle decks.

| Column | Type | What it holds |
| :--- | :--- | :--- |
| `id` | text | PK |
| `userId` | uuid | FK to `users` |
| `deckName` | text | Name of the deck |
| `cardIds` | jsonb | List of the 5 card ids |
| `totalStatCost` | integer | Total stats of the deck (must fit `maxStatBudget`) |
| `isDefault` | boolean | The deck used in battles |
| `createdAt` / `updatedAt` | timestamptz | |

---

## Events and trivia

### `campaigns`

A named time window, like "Term 3" or "Open Day". Events in a campaign are only shown to players while the campaign is running. Columns: `id`, `name`, `description`, `startDate`, `endDate`, `createdAt`. Deleting a campaign leaves its events without one.

### `events`

A place on campus where players answer trivia to earn rewards.

| Column | Type | Default | What it holds |
| :--- | :--- | :--- | :--- |
| `id` | text | | PK |
| `name` | text | | Event name |
| `lat`, `lng` | float | | Location |
| `radius` | integer | 25 | How close (in metres) a player must be |
| `startDate`, `endDate` | timestamptz | | When it runs |
| `active` | integer | 1 | 1 = running, 0 = not (a number, not true/false) |
| `cardReward` | text | | FK to `cards`: the card it gives |
| `xpAward` | integer | 100 | XP it gives |
| `essenceAward` | integer | 50 | Essence it gives |
| `autoPlaced` | integer | 0 | 1 = placed by the automatic event rotation, 0 = placed by an admin |
| `status` | text | `published` | `draft`, `review`, `published` or `retired` |
| `reviewRequestedBy` / `reviewRequestedAt` | text / timestamptz | | Who sent it for review, and when |
| `campaignId` | text | | FK to `campaigns` (optional) |
| `qr_secret` | text | | Secret behind the event's QR code. The API never sends it to the app |
| `createdAt` | timestamptz | now | |

### `event_attempts`

Records that a player completed an event: `userId`, `eventId`, `completedAt`. The pair (`userId`, `eventId`) is unique, so an event can only be completed once per player.

### `trivia_questions`

| Column | Type | What it holds |
| :--- | :--- | :--- |
| `id` | text | PK |
| `eventId` | text | FK to `events` |
| `orderIndex` | integer | Order of the question within the event |
| `question` | text | The question |
| `questionType` | text | `mc` (multiple choice) or `text` (typed answer) |
| `options` | jsonb | The choices, for multiple choice |
| `correctAnswer` | text | The right answer. Never sent to the app |
| `acceptedAnswers` | jsonb | Other accepted spellings, for typed answers |
| `status` | text | `draft`, `review`, `published` or `retired` |
| `reviewRequestedBy` / `reviewRequestedAt` | text / timestamptz | Who sent it for review, and when |
| `createdAt` | timestamptz | |

### `user_trivia_attempts`

Each player's answer to a question: `userId`, `triviaId`, `isCorrect`, `created_at`. The pair (`userId`, `triviaId`) is unique, so a question can only be answered once. The time is used by the anti-cheat check that spots impossible travel between two events.

---

## Battles

### `battle_matches`

The result of every finished battle.

| Column | Type | What it holds |
| :--- | :--- | :--- |
| `id` | text | PK |
| `matchType` | text | `CPU`, `LIVE_PVP` or `ASYNC_PVP` |
| `challengerId` | uuid | FK to `users` |
| `opponentId` | text | The other player's id, or `CPU_BOT` |
| `winnerId` | text | The winner's id, or `DRAW` |
| `roundsWonChallenger` / `roundsWonOpponent` | integer | Rounds each side won |
| `xpAwarded` / `essenceAwarded` | integer | Rewards given |
| `eloChange` | integer | How much the rating moved |
| `roundsData` | jsonb | Every round: cards played, stat chosen, who won |
| `createdAt` | timestamptz | |

`opponentId` and `winnerId` are not links to `users`, because they can also hold `CPU_BOT` or `DRAW`.

### `async_pvp_challenges`

A turn-based battle played over time, where each player moves when it suits them.

| Column | Type | What it holds |
| :--- | :--- | :--- |
| `id` | text | PK |
| `challengerId` / `defenderId` | uuid | FKs to `users` |
| `status` | text | `PENDING_ACCEPTANCE`, `CHALLENGER_TURN`, `DEFENDER_TURN`, `COMPLETED`, `EXPIRED` or `DECLINED` |
| `currentRound` / `maxRounds` | integer | Round now / rounds in total (5) |
| `challengerDeckIds` / `defenderDeckIds` | jsonb | Each side's deck |
| `roundsHistory` | jsonb | Finished rounds. Whose turn it is is worked out from this |
| `pendingPick` | jsonb | The card and stat picked this round, waiting for the other player |
| `defensiveTelemetry` | jsonb | Data about the defender's choices |
| `expiresAt` | timestamptz | When the challenge runs out |
| `createdAt` | timestamptz | |

---

## Trading

### `trade_offers`

One row per trade between two players.

| Column | Type | What it holds |
| :--- | :--- | :--- |
| `id` | uuid | PK |
| `sender_id` / `receiver_id` | uuid | FKs to `users`. A player can't trade with themselves |
| `status` | text | `pending`, `accepted`, `rejected` or `cancelled` |
| `created_at` / `responded_at` | timestamptz | When it was sent / answered |
| `expires_at` | timestamptz | 24 hours after it was sent |

### `trade_offer_items`

The cards in a trade: `trade_id` (FK to `trade_offers`), `user_id` (who gives the card), `user_card_id` (FK to `user_cards`), and `quantity` (must be more than 0). A card can't be deleted while it is part of a trade.

---

## Quest trails and territory

### `quest_trails`

A chain of events to complete in order, with a bonus at the end.

| Column | Type | What it holds |
| :--- | :--- | :--- |
| `id` | text | PK |
| `name`, `description` | text | |
| `rewardCardId` | text | FK to `cards`: bonus card (optional) |
| `rewardXp` / `rewardEssence` | integer | Bonus XP / Essence |
| `status` | text | `draft`, `published` or `retired` (default `draft`) |
| `createdAt` | timestamptz | |

### `quest_trail_steps`

The events in a trail: `trailId`, `eventId`, `orderIndex`. The pair (`trailId`, `orderIndex`) is unique, so each step number is used once.

### `user_quest_progress`

Each player's progress on a trail: `userId`, `trailId`, `currentStep`, `completedAt`. The pair (`userId`, `trailId`) is unique, which stops the trail bonus being paid twice.

### `territories`

Campus zones that players compete to own.

| Column | Type | What it holds |
| :--- | :--- | :--- |
| `id` | text | PK |
| `name`, `description` | text | |
| `north_lat`, `south_lat`, `east_lng`, `west_lng` | float | The zone's edges |
| `owner_id` / `owner_username` | uuid / text | Who owns it now |
| `captured_at` | timestamptz | When it last changed owner |
| `capture_count` | integer | How many times it has changed owner |
| `created_at` | timestamptz | |

### `territory_influence`

Each player's influence in each zone: `territory_id`, `user_id`, `username`, `influence`, `updated_at`. The key is the pair (`territory_id`, `user_id`). Completing an event in a zone gives +10 influence and winning a battle there gives +5. The player with the most influence owns the zone, and the owner keeps it on a tie.

---

## Ranked seasons

### `seasons`

Ranked seasons: `id`, `name`, `start_date`, `end_date`, `is_active`. The database starts with one active season, `season_1`.

### `season_snapshots`

The final leaderboard of a season, saved when it ends: `season_id`, `user_id`, `username`, `final_elo`, `rank`. The key is the pair (`season_id`, `user_id`).

---

## Anti-cheat

### `telemetry_pings`

The player's location, sent by the app while they play.

| Column | Type | What it holds |
| :--- | :--- | :--- |
| `id` | bigint | PK, counts up automatically |
| `user_id` | uuid | FK to `users` |
| `lat`, `lng` | float | Position |
| `timestamp` | timestamptz | When it was recorded |
| `accuracy` | float | GPS accuracy in metres |
| `source` | text | `qr` when the player checked in by scanning a QR code |

### `telemetry_flags`

Suspicious movement found automatically: `user_id`, `ping_id` (the ping that caused it), `flag_type` (`speed`, `teleport` or `poor_accuracy`), `details`, `created_at`.

### `telemetry_audit`

What admins did about a flagged player: `user_id`, `incident_id`, `action` (`warned`, `suspended` or `false_positive`), `admin_email`, `timestamp`. Rows are only ever added, never changed.

### `trust_tier_history`

Every change to a player's trust tier: `user_id`, `old_tier`, `new_tier`, `old_score`, `new_score`, `reason`, `created_at`. The trust score itself is worked out from the flags each time, not stored.

---

## Achievements

### `achievements`

The achievements players can unlock.

| Column | Type | What it holds |
| :--- | :--- | :--- |
| `id` | text | PK, for example `first_card` |
| `name`, `description`, `icon`, `category` | text | What players see |
| `rule_type` | text | What is counted: `cards_collected`, `deck_size`, `battles_won`, `battles_played` or `level_reached` |
| `target_value` | integer | The number needed to unlock it |
| `created_by` | text | The admin who made it |
| `active` | boolean | Only active achievements can be unlocked |

### `user_achievements`

Which player unlocked which achievement, and when: `user_id`, `achievement_id`, `unlocked_at`. The pair (`user_id`, `achievement_id`) is unique.

---

## Old tables in the live database

The live Supabase database still has two tables that the code doesn't use. They aren't in `schema.sql`, so a fresh database won't have them.

| Table | What it was | Replaced by |
| :--- | :--- | :--- |
| `battle_match_records` | Battle history with `snake_case` columns, used until August 2026 | `battle_matches` |
| `email_verification_codes` | Email check codes (`userId`, `code`, `expiresAt`, `used`). No code in the repo has ever used it; it was made directly in Supabase | Supabase Auth, which handles email checks |

They can be dropped once we're sure nothing in them is needed.

## Database functions

Some actions change several rows that must all change together, or none at all. These run as functions inside the database. Each one locks the rows it uses, so two requests at the same moment can't spend the same cards or Essence twice. Only the backend can call them.

| Function | What it does |
| :--- | :--- |
| `forge_scrap(inventory_id, user_id)` | Turns one spare copy of a card into Essence: Common 5, Rare 25, Epic 35, Legendary 50. The player must have at least 2 copies. |
| `forge_upgrade(inventory_id, user_id)` | Costs 100 Essence and 2 copies (the player needs at least 3). The card goes up 1 level and gets +5 to every stat. |
| `create_trade_offer(...)` | Creates a trade and its cards in one step. |
| `accept_trade_offer(trade_id, receiver_id)` | Swaps the cards. Refuses if the trade isn't pending or has expired, if either account is under 7 days old or suspended, if either player has already made 5 trades today, or if a player no longer has the cards. |
| `add_territory_influence(territory_id, user_id, username, amount)` | Adds influence in a zone and changes the owner if the player now has the most. |

## Security

- Only the backend reads and writes the database. It uses Supabase's service-role key, which stays on the server.
- The app only has Supabase's public key, which it uses to log players in. That key has **no access** to any table or function.
- Row-level security is switched on for every table, with no rules that let anyone else in.

This was set by the [lock-down migration](database-plan.md#changes-to-the-database) on 29 September 2026. Before it, anyone with the public key could have changed their own Essence or Elo directly.
