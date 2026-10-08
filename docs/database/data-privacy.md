# Data & Privacy

What personal data Wits Quest stores, who can see it, how long we keep it, and how we would recover the database if something went wrong.

---

## What we store about players

| Data | Where | Why we need it |
| :--- | :--- | :--- |
| Wits student email and student number | `users`, Supabase Auth | Only Wits students can sign up; the email must be `<7 digits>@students.wits.ac.za` |
| Password | Supabase Auth only | Logging in. We never see or store it ourselves |
| Username and avatar | `users` | Shown on the leaderboard and in battles |
| Game progress (XP, Essence, cards, decks, battles, trades) | Game tables | Playing the game |
| **Location (GPS pings)** | `telemetry_pings` | Checking that a player was really at an event, and catching cheating |
| Anti-cheat flags, admin actions and trust tier changes | `telemetry_flags`, `telemetry_audit`, `trust_tier_history` | Reviewing suspicious players fairly |

We don't store real names, phone numbers, ID numbers or payment details.

Location is the most sensitive data we keep. It's only collected while the game is open, and each ping is just a position and a time (plus GPS accuracy).

## Who can see it

| Who | What they can see |
| :--- | :--- |
| **The player** | Their own profile, cards, decks, battles and achievements |
| **Other players** | Usernames, levels, Elo and stats on the leaderboard and in battles, and each player's latest position on the map |
| **Admins** | Everything above, plus location history, anti-cheat flags, trust scores and the audit log |
| **Anyone else** | Nothing. Only the backend can read the database; see [Security](database-plan.md#security) |

Things we know still need fixing:

- `GET /api/users` and `GET /api/users/:id` return players' emails and student numbers, and don't require a login. They should require a login and leave out email and student number, like the leaderboard does.
- `GET /api/telemetry/players` shows every logged-in player the latest position of all players. It should be limited to admins, or to positions near events.

## How long we keep it

| Data | Kept for |
| :--- | :--- |
| Account and game progress | Until the player deletes their account |
| Location pings | Until the account is deleted. There's no automatic clean-up yet |
| Anti-cheat records | Until the account is deleted |
| Trade offers | Until the account is deleted (unanswered offers expire after 24 hours but stay as records) |

A sensible next step is to delete location pings after a set time, such as 30 days, once we've checked that the anti-cheat checks only need recent pings.

## Deleting an account

A player can delete their own account from the app (`DELETE /api/auth/me`). This removes their Supabase login, and the database then deletes their rows automatically: profile, cards, decks, battles, trades, pings, flags, achievements and progress.

Two links don't do this yet, and they will stop the delete from working:

- `trust_tier_history.user_id` doesn't delete with the player. Any player whose trust tier has ever changed can't delete their account.
- `territories.owner_id` doesn't clear when its owner is deleted. A player who owns a zone can't delete their account.

Both need a small migration: delete the player's history rows, and set the zone owner to empty.

## Test data

Test players made by the seed scripts use made-up details, never real students. They can be removed with the backend's clean-up script, so test accounts don't mix with real players on the leaderboard.

## Backups and recovery

- **The database structure** can always be rebuilt: run `schema.sql`, then the `trading` migration, in the Supabase SQL editor on an empty project. See [Changes to the database](database-plan.md#changes-to-the-database).
- **The game content** (cards, events and trivia) can be reloaded with the production seed script (`src/db/seedProduction.ts`).
- **Player data** (accounts and progress) can only be restored from Supabase's own backups, which depend on the project's plan. Before a risky change, such as running a new migration on the live database, export the affected tables from the Supabase dashboard first.
