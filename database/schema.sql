-- ============================================================================
-- Wits Quest — Full Database Schema
-- ============================================================================
-- Run this ENTIRE file once in the Supabase SQL Editor (Dashboard > SQL Editor
-- > New query > paste > Run) against a fresh/empty project.
--
-- This was reverse-engineered directly from the backend's actual
-- .from()/.select()/.insert()/.eq() calls across every route file — not just
-- docs/database/database-schema.md, which turned out to be stale/incomplete
-- in a few places (see notes inline, and personal/ or battle_AI_docs/ for the
-- session that produced this if you want the full trail).
--
-- Column names are camelCase to match what the Node backend sends via the
-- Supabase JS client (PostgREST maps JSON keys 1:1 to column names) — every
-- mixed-case identifier below is double-quoted for that reason. Two tables
-- (telemetry_pings, telemetry_audit) are snake_case in the actual code and
-- are created that way here to match.
--
-- RLS is left at its default (off) — the backend authenticates with a
-- `sb_secret_...` key (service-role equivalent), which bypasses RLS anyway,
-- and that key never reaches the browser.
-- ============================================================================

-- ── users ────────────────────────────────────────────────────────────────
create table if not exists users (
  id                  text primary key,
  email               text not null unique,
  "studentNumber"     text not null unique,
  username            text not null,
  "passwordHash"      text not null,
  role                text not null default 'STUDENT',            -- STUDENT | ADMIN | LECTURER
  level               integer not null default 1,
  "currentXP"         integer not null default 0,
  "totalXP"           integer not null default 0,
  "essenceBalance"    integer not null default 100,
  "dailyStreakCount"  integer not null default 1,
  "lastCheckInDate"   timestamptz not null default now(),
  "streakMultiplier"  double precision not null default 1.0,
  "eloRating"         integer not null default 1000,
  "divisionTier"      text not null default 'GOLD',                -- BRONZE|SILVER|GOLD|PLATINUM|DIAMOND
  "pvpWins"           integer not null default 0,
  "pvpLosses"         integer not null default 0,
  "pvpDraws"          integer not null default 0,
  "maxStatBudget"     integer not null default 300,
  "legendaryCap"      integer not null default 1,
  avatar              text default 'owl',                          -- not in docs, but load-bearing in code
  "createdAt"         timestamptz not null default now(),
  "updatedAt"         timestamptz not null default now()
);

-- ── cards (master catalog) ──────────────────────────────────────────────
create table if not exists cards (
  id            text primary key,
  name          text not null,
  category      text not null,     -- Science|History|Landmarks|Lifestyle|Sports
  rarity        text not null,     -- Common|Rare|Epic|Legendary
  "baseAttack"  integer not null,
  "baseDefense" integer not null,
  "baseSpeed"   integer not null,
  "baseBrains"  integer not null,
  "totalStats"  integer not null,
  "imageUrl"    text not null,
  "landmarkId"  text
);

-- ── user_cards (inventory) ──────────────────────────────────────────────
create table if not exists user_cards (
  id             text primary key,
  "userId"       text not null references users(id) on delete cascade,
  "cardId"       text not null references cards(id) on delete cascade,
  level          integer not null default 1,
  "attackBonus"  integer not null default 0,
  "defenseBonus" integer not null default 0,
  "speedBonus"   integer not null default 0,
  "brainsBonus"  integer not null default 0,
  quantity       integer not null default 1,
  "acquiredAt"   timestamptz default now()   -- nullable: content.ts's trivia/answer insert path omits it
);
create index if not exists idx_user_cards_user on user_cards("userId");

-- ── user_decks ───────────────────────────────────────────────────────────
create table if not exists user_decks (
  id                text primary key,
  "userId"          text not null references users(id) on delete cascade,
  "deckName"        text not null,
  "cardIds"         jsonb not null,          -- array of card ids
  "totalStatCost"   integer not null,
  "isDefault"       boolean not null default false,
  "createdAt"       timestamptz not null default now(),
  "updatedAt"       timestamptz not null default now()
);
create index if not exists idx_user_decks_user on user_decks("userId");

-- ── battle_matches ───────────────────────────────────────────────────────
-- opponentId/winnerId can hold sentinel strings ('CPU_BOT', 'DRAW'), not
-- just user ids — deliberately NOT a foreign key to users(id).
create table if not exists battle_matches (
  id                     text primary key,
  "matchType"            text not null,     -- CPU | LIVE_PVP | ASYNC_PVP
  "challengerId"         text not null references users(id) on delete cascade,
  "opponentId"           text not null,
  "winnerId"             text not null,
  "roundsWonChallenger"  integer not null default 0,
  "roundsWonOpponent"    integer not null default 0,
  "xpAwarded"            integer not null default 0,
  "essenceAwarded"       integer not null default 0,
  "eloChange"            integer not null default 0,
  "roundsData"           jsonb not null default '[]'::jsonb,
  "createdAt"            timestamptz not null default now()
);
create index if not exists idx_battle_matches_challenger on battle_matches("challengerId");

-- ── events (campus landmark events) ─────────────────────────────────────
-- `active` is an INTEGER (0/1), not boolean — the code does numeric .eq()
-- comparisons against literal 0/1, a boolean column would silently not match.
create table if not exists events (
  id             text primary key,
  name           text not null,
  lat            double precision not null,
  lng            double precision not null,
  radius         integer not null default 25,
  "startDate"    timestamptz,
  "endDate"      timestamptz,
  active         integer not null default 1,
  "cardReward"   text references cards(id),
  "xpAward"      integer not null default 100,
  "essenceAward" integer not null default 50,
  "createdAt"    timestamptz not null default now()
);

-- ── trivia_questions ─────────────────────────────────────────────────────
-- Two different route implementations (content.ts and server.ts) use
-- overlapping-but-not-identical column sets against this one table — this
-- is the union of both, with the columns only one side uses left nullable
-- so neither code path breaks. `status` defaults to 'published' so rows
-- inserted by server.ts's path (which never sets it) still show up in
-- content.ts's `.eq('status','published')` queries.
-- correctIndex from docs/database-schema.md is NOT created — no code
-- anywhere actually reads/writes that column, only `correctAnswer` (which
-- is overloaded to sometimes hold a stringified index).
create table if not exists trivia_questions (
  id                text primary key,
  "eventId"         text not null references events(id) on delete cascade,
  "orderIndex"      integer default 0,           -- only content.ts's multi-question flow uses this
  question          text not null,
  "questionType"    text not null default 'mc',  -- 'mc' | 'text'
  options           jsonb default '[]'::jsonb,   -- MC options, content.ts defaults to [] if omitted
  "correctAnswer"   text,                        -- answer text OR a stringified option index, depending on which route wrote it
  "acceptedAnswers" jsonb,                        -- text-question accepted answers (server.ts path only)
  status            text default 'published',     -- only value ever written is 'published'
  "createdAt"       timestamptz not null default now()
);
create index if not exists idx_trivia_event on trivia_questions("eventId");

-- ── user_trivia_attempts ─────────────────────────────────────────────────
create table if not exists user_trivia_attempts (
  id           text primary key,
  "userId"     text not null references users(id) on delete cascade,
  "triviaId"   text not null references trivia_questions(id) on delete cascade,
  "isCorrect"  boolean not null,
  unique ("userId", "triviaId")
);

-- ── avatars ──────────────────────────────────────────────────────────────
-- cssClass/description are nullable here even though docs said NOT NULL —
-- the actual insert path (auth.ts POST /avatars) doesn't require them, so a
-- NOT NULL constraint would turn a missing-field request into a 500 instead
-- of the validation error the code intends.
create table if not exists avatars (
  id           text primary key,
  emoji        text not null,
  label        text not null,
  "cssClass"   text,
  description  text
);

-- ── telemetry_pings (snake_case — matches code exactly) ─────────────────
create table if not exists telemetry_pings (
  id         bigint generated always as identity primary key,
  user_id    text not null references users(id) on delete cascade,
  lat        double precision not null,
  lng        double precision not null,
  timestamp  timestamptz not null default now()
);
create index if not exists idx_telemetry_pings_user on telemetry_pings(user_id);

-- ── telemetry_audit (snake_case — matches code exactly, append-only log) ─
create table if not exists telemetry_audit (
  id            text primary key,
  user_id       text not null references users(id) on delete cascade,
  incident_id   text,
  action        text not null,     -- 'warned' | 'suspended' | 'false_positive'
  admin_email   text not null default 'unknown@wits.ac.za',
  timestamp     timestamptz not null default now()
);
create index if not exists idx_telemetry_audit_user on telemetry_audit(user_id);

-- ── async_pvp_challenges ─────────────────────────────────────────────────
-- Backs Domain 2 task 2.3 (backend/src/routes/asyncBattle.ts). `status` is
-- free text (no DB-level enum) so it can move between 'PENDING_ACCEPTANCE'
-- | 'CHALLENGER_TURN' | 'DEFENDER_TURN' | 'COMPLETED' | 'EXPIRED' |
-- 'DECLINED' (models/schema.ts's ChallengeStatus) without a migration.
-- `roundsHistory` is the only source of truth for whose turn it is and each
-- side's per-stat quota — asyncChallengeState.ts derives both from it
-- rather than persisting redundant columns.
create table if not exists async_pvp_challenges (
  id                    text primary key,
  "challengerId"        text not null references users(id) on delete cascade,
  "defenderId"          text not null references users(id) on delete cascade,
  status                text not null default 'PENDING_ACCEPTANCE',
  "currentRound"        integer not null default 1,
  "maxRounds"           integer not null default 5,
  "challengerDeckIds"   jsonb default '[]'::jsonb,
  "defenderDeckIds"     jsonb default '[]'::jsonb,
  "roundsHistory"       jsonb default '[]'::jsonb,
  "defensiveTelemetry"  jsonb,
  "expiresAt"           timestamptz not null,
  "createdAt"           timestamptz not null default now()
);

-- ============================================================================
-- Grants — separate from RLS
-- ============================================================================
-- Creating a table via the SQL Editor (as the `postgres` role) does NOT
-- automatically give Supabase's API roles (anon, authenticated, service_role)
-- read/write access to it — that's a plain Postgres GRANT, unrelated to RLS.
-- Supabase's dashboard "Table Editor" sets these up for you automatically;
-- raw SQL Editor `CREATE TABLE` does not. Without this block, PostgREST
-- returns "permission denied for schema public" / "permission denied for
-- table X" even though the tables exist and RLS is off.
grant usage on schema public to anon, authenticated, service_role;
grant all on all tables in schema public to anon, authenticated, service_role;
grant all on all sequences in schema public to anon, authenticated, service_role;
grant all on all routines in schema public to anon, authenticated, service_role;

-- So this also applies automatically to any table added later (e.g. if you
-- extend this schema for Async PvP or another feature) without re-running
-- the grants above by hand.
alter default privileges in schema public grant all on tables to anon, authenticated, service_role;
alter default privileges in schema public grant all on sequences to anon, authenticated, service_role;
alter default privileges in schema public grant all on routines to anon, authenticated, service_role;

-- Nudge PostgREST to pick up the new tables/grants immediately rather than
-- waiting for its next automatic schema-cache refresh.
notify pgrst, 'reload schema';
