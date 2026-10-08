# Scope

## In scope

Wits Quest is built for the COMS3011A course against the three-tier brief on the [Requirements](requirements.md) page. We are building:

- A **web app** (React, works on phones) and a separate **backend API** (Node.js + Express).
- **Login with Supabase Auth.** The brief says not to write our own login system, so we use an established one. Players can sign up, verify their email, sign in, reset their password and delete their account.
- A **PostgreSQL database** (on Supabase) for players, cards, decks, events, matches, trades, trails and anti-cheat data. See [Database Schema](../database/database-schema.md).
- An **admin console** for adding content, reviewing it before it goes live, checking suspicious players and viewing analytics.

## Out of scope

- **Native phone apps.** The game is a web app that runs in the phone's browser.
- **Real money.** Essence is an in-game currency only.
- **Other campuses.** Locations, trivia and cards are about Wits only.

## Who owns what

Each of the six members owns one area of the game, from screen to database. See [Development Architecture](../development/architecture.md#who-owns-what) for the files each person owns.

| Member | Area |
| :--- | :--- |
| Junior | Map, location, walking directions and trading |
| Mahlatse | Battles: CPU, live, async and spectating |
| Kgothatso | Database, API, login, achievements and streaks |
| Rea | Admin console, content curation and automatic event placement |
| Nontokozo | Cards, forge, trails, territory and ranked seasons |
| Oratile | Anti-cheat, QR check-in and analytics |

## Assumptions

- Players are Wits students or staff with a Wits email address.
- Ranked seasons and campaigns run for one term or event at a time.
