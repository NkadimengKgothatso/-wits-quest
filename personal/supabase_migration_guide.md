# Supabase Migration Guide for Wits Quest

Migrating from your local, in-memory SQLite database (`sql.js`) to Supabase (PostgreSQL) is an excellent choice for a deployed application. It will solve your data persistence issues completely.

Here is a step-by-step guide on how to approach the migration.

## Phase 1: Set up Supabase

1. Go to [Supabase](https://supabase.com/) and sign up for a free account.
2. Click **"New Project"**.
3. Select your organization, give your project a name (e.g., "Wits Quest"), set a strong database password, and choose a region close to your users (e.g., South Africa if available, or EU).
4. Once the project finishes provisioning (this takes a few minutes), go to **Project Settings -> API** to get your `Project URL` and `anon public` API key.
5. Go to **Project Settings -> Database** to get your `Connection String` (URI).

## Phase 2: Update Environment Variables

In your `backend` folder, update your `.env` file to include the Supabase credentials:

```env
# backend/.env
SUPABASE_URL=your_project_url_here
SUPABASE_KEY=your_anon_public_key_here
DATABASE_URL=your_postgresql_connection_string_here
```

## Phase 3: Choose Your Architecture approach

You have two main paths you can take to connect your Node.js backend to Supabase:

### Approach A: Use the Supabase JavaScript Client (Recommended)
Instead of writing raw SQL queries (`db.run()`), you use Supabase's SDK. This is the standard, safest, and most robust way to use Supabase.
1. Install the SDK: 
   ```bash
   cd backend
   npm install @supabase/supabase-js
   ```
2. Create a new file `backend/src/db/supabaseClient.ts`:
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   import dotenv from 'dotenv';
   dotenv.config();
   
   const supabaseUrl = process.env.SUPABASE_URL!;
   const supabaseKey = process.env.SUPABASE_KEY!;
   
   export const supabase = createClient(supabaseUrl, supabaseKey);
   ```
3. Replace your `queryOne` and `runAndPersist` calls in `auth.ts` with Supabase queries. For example:
   ```typescript
   // Old SQLite:
   // const existing = queryOne('SELECT id FROM users WHERE email = ?', [email]);
   
   // New Supabase:
   const { data: existing, error } = await supabase
     .from('users')
     .select('id')
     .eq('email', email)
     .single();
   ```

### Approach B: Use raw PostgreSQL queries
If you want to keep writing raw SQL queries, you can connect directly to the Postgres database using a package like `pg` or `postgres`.
1. Install the postgres driver: `npm install postgres`
2. Update `connection.ts` to connect via the `DATABASE_URL`.
3. Note: You will need to change SQLite specific syntax (like `datetime('now')` to Postgres syntax like `NOW()`).

## Phase 4: Create the Database Schema (FIXED: Case-Sensitive Columns)

PostgreSQL automatically converts column names to lowercase unless they are explicitly wrapped in double quotes. Because your frontend relies on camelCase property names (like `createdAt` instead of `createdat`), we must force Postgres to preserve the case!

Run this in your **Supabase Dashboard -> SQL Editor** to drop the old lowercase tables and recreate them properly:

```sql
-- DROP the old tables that had lowercase column issues
DROP TABLE IF EXISTS "async_pvp_challenges" CASCADE;
DROP TABLE IF EXISTS "battle_matches" CASCADE;
DROP TABLE IF EXISTS "user_decks" CASCADE;
DROP TABLE IF EXISTS "user_cards" CASCADE;
DROP TABLE IF EXISTS "cards" CASCADE;
DROP TABLE IF EXISTS "users" CASCADE;
DROP TABLE IF EXISTS "avatars" CASCADE;

-- 1. users
CREATE TABLE "users" (
  "id" TEXT PRIMARY KEY,
  "email" TEXT UNIQUE NOT NULL,
  "studentNumber" TEXT UNIQUE NOT NULL,
  "username" TEXT UNIQUE NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "role" TEXT NOT NULL DEFAULT 'STUDENT',
  "level" INTEGER NOT NULL DEFAULT 1,
  "currentXP" INTEGER NOT NULL DEFAULT 0,
  "totalXP" INTEGER NOT NULL DEFAULT 0,
  "essenceBalance" INTEGER NOT NULL DEFAULT 100,
  "dailyStreakCount" INTEGER NOT NULL DEFAULT 1,
  "lastCheckInDate" TEXT NOT NULL,
  "streakMultiplier" REAL NOT NULL DEFAULT 1.0,
  "eloRating" INTEGER NOT NULL DEFAULT 1000,
  "divisionTier" TEXT NOT NULL DEFAULT 'GOLD',
  "pvpWins" INTEGER NOT NULL DEFAULT 0,
  "pvpLosses" INTEGER NOT NULL DEFAULT 0,
  "pvpDraws" INTEGER NOT NULL DEFAULT 0,
  "maxStatBudget" INTEGER NOT NULL DEFAULT 300,
  "legendaryCap" INTEGER NOT NULL DEFAULT 1,
  "avatar" TEXT NOT NULL DEFAULT 'owl',
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. cards
CREATE TABLE "cards" (
  "id" TEXT PRIMARY KEY,
  "name" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "rarity" TEXT NOT NULL,
  "baseAttack" INTEGER NOT NULL,
  "baseDefense" INTEGER NOT NULL,
  "baseSpeed" INTEGER NOT NULL,
  "baseBrains" INTEGER NOT NULL,
  "totalStats" INTEGER NOT NULL,
  "imageUrl" TEXT NOT NULL,
  "landmarkId" TEXT
);

-- 3. user_cards
CREATE TABLE "user_cards" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "users"("id"),
  "cardId" TEXT NOT NULL REFERENCES "cards"("id"),
  "level" INTEGER NOT NULL DEFAULT 1,
  "attackBonus" INTEGER NOT NULL DEFAULT 0,
  "defenseBonus" INTEGER NOT NULL DEFAULT 0,
  "speedBonus" INTEGER NOT NULL DEFAULT 0,
  "brainsBonus" INTEGER NOT NULL DEFAULT 0,
  "quantity" INTEGER NOT NULL DEFAULT 1,
  "acquiredAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. user_decks
CREATE TABLE "user_decks" (
  "id" TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL REFERENCES "users"("id"),
  "deckName" TEXT NOT NULL,
  "cardIds" JSONB NOT NULL,
  "totalStatCost" INTEGER NOT NULL,
  "isDefault" BOOLEAN NOT NULL DEFAULT FALSE,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. battle_matches
CREATE TABLE "battle_matches" (
  "id" TEXT PRIMARY KEY,
  "matchType" TEXT NOT NULL,
  "challengerId" TEXT NOT NULL REFERENCES "users"("id"),
  "opponentId" TEXT NOT NULL,
  "winnerId" TEXT NOT NULL,
  "roundsWonChallenger" INTEGER NOT NULL,
  "roundsWonOpponent" INTEGER NOT NULL,
  "xpAwarded" INTEGER NOT NULL,
  "essenceAwarded" INTEGER NOT NULL,
  "eloChange" INTEGER NOT NULL,
  "roundsData" JSONB NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. async_pvp_challenges
CREATE TABLE "async_pvp_challenges" (
  "id" TEXT PRIMARY KEY,
  "challengerId" TEXT NOT NULL REFERENCES "users"("id"),
  "defenderId" TEXT NOT NULL REFERENCES "users"("id"),
  "status" TEXT NOT NULL DEFAULT 'PENDING_DEFENDER_TURN',
  "currentRound" INTEGER NOT NULL DEFAULT 1,
  "maxRounds" INTEGER NOT NULL DEFAULT 5,
  "challengerDeckIds" JSONB NOT NULL DEFAULT '[]',
  "defenderDeckIds" JSONB NOT NULL DEFAULT '[]',
  "roundsHistory" JSONB NOT NULL DEFAULT '[]',
  "defenderTelemetry" JSONB,
  "expiresAt" TEXT NOT NULL,
  "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. avatars
CREATE TABLE "avatars" (
  "id" TEXT PRIMARY KEY,
  "emoji" TEXT NOT NULL,
  "label" TEXT NOT NULL,
  "cssClass" TEXT NOT NULL,
  "description" TEXT NOT NULL
);
```

## Phase 5: Clean up Old Code

Once you've confirmed Supabase is working:
1. Uninstall the old SQLite packages: `npm uninstall sql.js sqlite3`
2. Delete `wits_quest.db` and `wits-quest-dev.sqlite`.
3. You can safely remove the `writeFileSync` loop logic (`persist()`) from your codebase, because Supabase handles all data storage in the cloud automatically!
