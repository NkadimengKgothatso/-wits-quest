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
-- id is Supabase Auth's own uuid (auth.users.id) — Supabase Auth owns
-- credentials/sessions entirely now, so there's no passwordHash column here.
create table if not exists users (
  id                  uuid primary key references auth.users(id) on delete cascade,
  email               text not null unique,
  "studentNumber"     text not null unique,
  username            text not null,
  role                text not null default 'STUDENT',            -- STUDENT | ADMIN | LECTURER
  "isOnline"          boolean not null default false,
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
  "maxStatBudget"     integer not null default 2000,
  "legendaryCap"      integer not null default 1,
  avatar              text default 'owl',                          -- not in docs, but load-bearing in code
  "lastAction"        text,
  "lastActionAt"      timestamptz,
  "createdAt"         timestamptz not null default now(),
  "updatedAt"         timestamptz not null default now()
);

-- ── cards (master catalog) ──────────────────────────────────────────────
-- status: 'draft' (admin-only, hidden from players) | 'published' | 'retired'
-- (hidden from the player catalog but kept for anyone who already owns a
-- copy). Mirrors trivia_questions.status below — same three-state lifecycle,
-- same reasoning: newly authored content needs a curation step before it's
-- visible to students.
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
  "imageUrl"     text not null,
  "landmarkId"   text,
  -- Content lifecycle: 'draft' (hidden from players) | 'review' (awaiting a
  -- second admin's approval) | 'published' | 'retired'. Default 'published'
  -- keeps pre-existing rows and the seed script's status-less upserts visible;
  -- the admin creation route in content.ts inserts 'draft' explicitly so new
  -- admin content starts hidden.
  status         text not null default 'published',
  -- Who submitted the content for review (draft → review); publishing from
  -- 'review' requires a DIFFERENT admin than this one.
  "reviewRequestedBy" text,
  "reviewRequestedAt" timestamptz
);

-- Existing deployments (table already created before `status` existed): run
-- once in the Supabase SQL Editor. Idempotent — safe to re-run.
alter table cards add column if not exists status text not null default 'published';

-- ── user_cards (inventory) ──────────────────────────────────────────────
create table if not exists user_cards (
  id             text primary key,
  "userId"       uuid not null references users(id) on delete cascade,
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
  "userId"          uuid not null references users(id) on delete cascade,
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
  "challengerId"         uuid not null references users(id) on delete cascade,
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

-- ── campaigns (term / open-day scheduling windows) ───────────────────────
-- A named window ("Term 3", "September Open Day") that events can be
-- assigned to. Player-facing event reads only serve campaign-assigned
-- events while the window is open — see content.ts + auth.ts. Deleting a
-- campaign unschedules its events (their campaignId is set to NULL).
-- Created before events because events.campaignId references it.
create table if not exists campaigns (
  id            text primary key,
  name          text not null,
  description   text,
  "startDate"   timestamptz not null,
  "endDate"     timestamptz not null,
  "createdAt"   timestamptz not null default now()
);

-- ── events (campus landmark events) ─────────────────────────────────────
-- `active` is an INTEGER (0/1), not boolean — the code does numeric .eq()
-- comparisons against literal 0/1, a boolean column would silently not match.
-- status follows the same draft/published/retired lifecycle as cards/
-- trivia_questions — separate from `active`, which is about whether a
-- published event is currently running (date window), not whether it's
-- visible to players at all.
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
  "createdAt"    timestamptz not null default now(),
  -- 1 = placed by the event placement service (rotates automatically);
  -- 0/NULL = placed manually by an admin. Lets the service retire only its
  -- own events and keep rotation history for least-recently-used selection.
  "autoPlaced"   integer not null default 0,
  -- Same lifecycle vocabulary as cards.status. Default 'published' keeps
  -- existing rows visible (run the ALTER below before deploying a backend
  -- that filters on it); admin-created events insert 'draft' explicitly and
  -- the placement service stamps its own events 'published'.
  "status"       text not null default 'published',
  "reviewRequestedBy" text,
  "reviewRequestedAt" timestamptz,
  -- Optional scheduling window grouping (term / open day) — events in a
  -- campaign are only served to players while the campaign window is open.
  "campaignId"   text references campaigns(id),
  -- Per-event QR check-in secret (POST /api/events/:id/generate-qr); null
  -- until an admin issues one. Rotating it invalidates old printouts on
  -- purpose; the API never returns this column (utils/eventPayload.ts).
  qr_secret      text
);

-- Existing deployments (table already created before these columns existed):
-- run these once in the Supabase SQL Editor. They are idempotent — but run
-- them BEFORE deploying a backend that queries the new columns, or the
-- events/cards reads will 500 until the columns exist.
alter table events add column if not exists "autoPlaced" integer not null default 0;
alter table events add column if not exists "status" text not null default 'published';
alter table cards add column if not exists "status" text not null default 'published';
-- trivia_questions.status has existed since the curation board, but older
-- deployments created without it get it here.
alter table trivia_questions add column if not exists status text default 'published';

-- ── Review step (draft → review → published) ─────────────────────────────
-- 'review' sits between draft and published: the authoring admin submits,
-- and a SECOND admin approves the publish. reviewRequestedBy stores the
-- submitter's user id so the approving admin can be verified to be someone
-- else (enforced in content.ts's PATCH /…/status routes).
alter table events add column if not exists "reviewRequestedBy" text;
alter table events add column if not exists "reviewRequestedAt" timestamptz;
alter table trivia_questions add column if not exists "reviewRequestedBy" text;
alter table trivia_questions add column if not exists "reviewRequestedAt" timestamptz;
alter table cards add column if not exists "reviewRequestedBy" text;
alter table cards add column if not exists "reviewRequestedAt" timestamptz;

-- Campaign scheduling for existing deployments (fresh ones get the column
-- from the events CREATE above; the ALTER is a no-op there).
alter table events add column if not exists "campaignId" text references campaigns(id);
create index if not exists idx_events_campaign on events("campaignId");

-- QR proof-of-presence (weak-GPS fallback). Regenerating the secret
-- invalidates previously printed QR codes on purpose. The API never returns
-- this column to clients — see backend/src/utils/eventPayload.ts.
alter table events add column if not exists qr_secret text;

create table if not exists event_attempts (
  id            text primary key,
  "userId"      uuid not null references users(id) on delete cascade,
  "eventId"     text not null references events(id) on delete cascade,
  "completedAt" timestamptz not null default now(),
  unique ("userId", "eventId")
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
  status            text default 'published',     -- 'draft' | 'review' | 'published' | 'retired' (content lifecycle)
  "reviewRequestedBy" text,
  "reviewRequestedAt" timestamptz,
  "createdAt"       timestamptz not null default now()
);
create index if not exists idx_trivia_event on trivia_questions("eventId");

-- ── user_trivia_attempts ─────────────────────────────────────────────────
create table if not exists user_trivia_attempts (
  id           text primary key,
  "userId"     uuid not null references users(id) on delete cascade,
  "triviaId"   text not null references trivia_questions(id) on delete cascade,
  "isCorrect"  boolean not null,
  created_at   timestamptz default now(),
  unique ("userId", "triviaId")
);

-- Existing deployments (table already created before `created_at` existed):
-- run once in the Supabase SQL Editor. Idempotent — safe to re-run. The
-- impossible-travel check needs it to know when the previous event was
-- answered.
alter table user_trivia_attempts add column if not exists created_at timestamptz default now();

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
  user_id    uuid not null references users(id) on delete cascade,
  lat        double precision not null,
  lng        double precision not null,
  timestamp  timestamptz not null default now(),
  accuracy   double precision,                  -- device-reported GPS accuracy (m)
  source     text                               -- 'qr' on QR check-in pings (accuracy 0, event coords)
);
create index if not exists idx_telemetry_pings_user on telemetry_pings(user_id);
create index if not exists idx_telemetry_pings_timestamp on telemetry_pings(timestamp);

-- QR check-ins are identified by accuracy = 0 (always present); `source`
-- is a best-effort label the route adds when the column exists, so the
-- feature works even before this ALTER is run in the SQL Editor.
alter table telemetry_pings add column if not exists source text;

-- ── telemetry_audit (snake_case — matches code exactly, append-only log) ─
create table if not exists telemetry_audit (
  id            text primary key,
  user_id       uuid not null references users(id) on delete cascade,
  incident_id   text,
  action        text not null,     -- 'warned' | 'suspended' | 'false_positive'
  admin_email   text not null default 'unknown@wits.ac.za',
  timestamp     timestamptz not null default now()
);
create index if not exists idx_telemetry_audit_user on telemetry_audit(user_id);

-- ── telemetry_flags (snake_case) ─────────────────────────────────────────
-- Raised automatically as pings arrive (backend/src/utils/antiCheat.ts).
-- RLS on with no policies: backend-only (service role), never the anon key.
create table if not exists telemetry_flags (
  id          text primary key,
  user_id     uuid not null references users(id) on delete cascade,
  ping_id     bigint references telemetry_pings(id) on delete set null,
  flag_type   text not null check (flag_type in ('speed', 'teleport', 'poor_accuracy')),
  details     jsonb not null default '{}'::jsonb,
  created_at  timestamptz not null default now()
);
create index if not exists idx_telemetry_flags_user on telemetry_flags(user_id);
create index if not exists idx_telemetry_flags_created on telemetry_flags(created_at desc);
alter table telemetry_flags enable row level security;

-- ── achievements / user_achievements (snake_case) ────────────────────────
-- Catalogue ids must match CHECKS in backend/src/utils/achievements.ts; the
-- rows themselves are seeded by
-- docs/database/migrations/2026-09-21-anti-cheat-analytics.sql.
create table if not exists achievements (
  id           text primary key,
  name         text not null,
  description  text not null,
  icon         text not null,
  category     text not null,
  -- Admin-defined rule (utils/achievements.ts): unlocks when the player's
  -- stat for rule_type reaches target_value. Only active rows with a rule
  -- are checked. See migrations/2026-09-29-admin-achievements.sql.
  rule_type    text,
  target_value integer,
  created_by   text,
  active       boolean not null default true
);
alter table achievements enable row level security;

create table if not exists user_achievements (
  id              text primary key,
  user_id         uuid not null references users(id) on delete cascade,
  achievement_id  text not null references achievements(id) on delete cascade,
  unlocked_at     timestamptz not null default now(),
  unique (user_id, achievement_id)
);
create index if not exists idx_user_achievements_user on user_achievements(user_id);
alter table user_achievements enable row level security;

-- ── async_pvp_challenges ─────────────────────────────────────────────────
-- Backs Domain 2 task 2.3 (backend/src/routes/asyncBattle.ts). `status` is
-- free text (no DB-level enum) so it can move between 'PENDING_ACCEPTANCE'
-- | 'CHALLENGER_TURN' | 'DEFENDER_TURN' | 'COMPLETED' | 'EXPIRED' |
-- 'DECLINED' (models/schema.ts's ChallengeStatus) without a migration.
-- `roundsHistory` is the only source of truth for whose turn it is and each
-- side's per-stat quota — asyncChallengeState.ts derives both from it
-- rather than persisting redundant columns.
-- `pendingPick` holds the in-flight pick for the round in progress —
-- {by, cardId, stat, auto?} — while the OTHER side responds. A round only
-- gets appended to roundsHistory once both a pick and a response exist;
-- see the 2026-09-14 revision in personal/async-pvp-walkthrough.md for why
-- (rounds used to auto-resolve against the non-picker's default card
-- instead of waiting for their actual response — this column is what makes
-- waiting possible).
create table if not exists async_pvp_challenges (
  id                    text primary key,
  "challengerId"        uuid not null references users(id) on delete cascade,
  "defenderId"          uuid not null references users(id) on delete cascade,
  status                text not null default 'PENDING_ACCEPTANCE',
  "currentRound"        integer not null default 1,
  "maxRounds"           integer not null default 5,
  "challengerDeckIds"   jsonb default '[]'::jsonb,
  "defenderDeckIds"     jsonb default '[]'::jsonb,
  "roundsHistory"       jsonb default '[]'::jsonb,
  "pendingPick"         jsonb,
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
-- ── seasons ──────────────────────────────────────────────────────────────────
-- Ranked seasons with archive and soft-reset
create table if not exists seasons (
  id          text primary key,
  name        text not null,
  start_date  timestamptz not null default now(),
  end_date    timestamptz,
  is_active   boolean not null default true
);

-- ── season_snapshots ─────────────────────────────────────────────────────────
-- Leaderboard snapshot at end of each season
create table if not exists season_snapshots (
  season_id   text references seasons(id) on delete cascade,
  user_id     uuid references users(id) on delete cascade,
  username    text,
  final_elo   int not null,
  rank        int not null,
  primary key (season_id, user_id)
);

-- ── trust_tier_history (snake_case) ──────────────────────────────────────────
-- One row per trust-tier change, written by recordTierChange in
-- backend/src/routes/telemetry.ts whenever a player's tier moves (baseline
-- rows use old_tier = new_tier so the admin timeline has a starting point).
create table if not exists trust_tier_history (
  id          text primary key,
  user_id     uuid not null references users(id),
  old_tier    text not null,
  new_tier    text not null,
  old_score   integer not null,
  new_score   integer not null,
  reason      text,
  created_at  timestamptz default now()
);

create index if not exists idx_trust_tier_history_user on trust_tier_history(user_id);

-- Start with one active season so GET /ranked/season/current has something
-- to return before an admin ever archives one.
insert into seasons (id, name, is_active)
select 'season_1', 'Season 1', true
where not exists (select 1 from seasons where is_active);

-- ── territories ────────────────────────────────────────────────────────
-- Campus zones that players can fight over. Winning a battle at an event
-- inside a zone flips ownership to the winner.
create table if not exists territories (
  id              text primary key,
  name            text not null,
  description     text,
  north_lat       double precision not null,
  south_lat       double precision not null,
  east_lng        double precision not null,
  west_lng        double precision not null,
  owner_id        uuid references users(id),
  owner_username  text,
  captured_at     timestamptz,
  capture_count   int not null default 0,
  created_at      timestamptz not null default now()
);
create index if not exists idx_territories_bounds on territories(north_lat, south_lat, east_lng, west_lng);

-- Influence per player per zone (contested territories). The owner is the
-- player with the most influence; add_territory_influence below adds
-- influence and changes the owner as one locked step.
create table if not exists territory_influence (
  territory_id  text not null references territories(id) on delete cascade,
  user_id       uuid not null references users(id) on delete cascade,
  username      text,
  influence     integer not null default 0,
  updated_at    timestamptz not null default now(),
  primary key (territory_id, user_id)
);
create index if not exists idx_territory_influence_zone
  on territory_influence (territory_id, influence desc);

create or replace function add_territory_influence(
  p_territory_id text,
  p_user_id      uuid,
  p_username     text,
  p_amount       integer
)
returns json
language plpgsql
security definer
set search_path = public
as $$
declare
  v_owner       uuid;
  v_owner_inf   integer;
  v_mine        integer;
  v_captured    boolean := false;
begin
  -- Serialise every capture of this zone behind one row lock.
  select owner_id into v_owner from territories where id = p_territory_id for update;
  if not found then
    return null;
  end if;

  insert into territory_influence (territory_id, user_id, username, influence)
  values (p_territory_id, p_user_id, p_username, greatest(p_amount, 0))
  on conflict (territory_id, user_id) do update
    set influence  = territory_influence.influence + excluded.influence,
        username   = excluded.username,
        updated_at = now()
  returning influence into v_mine;

  if v_owner is distinct from p_user_id then
    select influence into v_owner_inf
    from territory_influence
    where territory_id = p_territory_id and user_id = v_owner;

    if v_owner is null or v_mine > coalesce(v_owner_inf, 0) then
      update territories
      set owner_id       = p_user_id,
          owner_username = p_username,
          captured_at    = now(),
          capture_count  = capture_count + 1
      where id = p_territory_id;
      v_captured := true;
    end if;
  end if;

  return json_build_object(
    'captured',  v_captured,
    'influence', v_mine,
    'ownerId',   case when v_captured then p_user_id else v_owner end
  );
end;
$$;

-- Only the backend (service role) may call it.
revoke execute on function add_territory_influence(text, uuid, text, integer) from public, anon, authenticated;
grant execute on function add_territory_influence(text, uuid, text, integer) to service_role;
grant all on table territory_influence to service_role;

-- ── quest_trails ───────────────────────────────────────────────────────
-- Chained event sequences with rewards. Players complete steps in order;
-- each step requires completing the linked event first.
-- Column names are camelCase (quoted) to match routes/trails.ts and the
-- rest of this schema.
create table if not exists quest_trails (
  id              text primary key,
  name            text not null,
  description     text,
  "rewardCardId"  text references cards(id),
  "rewardXp"      int not null default 0,
  "rewardEssence" int not null default 0,
  status          text not null default 'draft' check (status in ('draft', 'published', 'retired')),
  "createdAt"     timestamptz not null default now()
);

create table if not exists quest_trail_steps (
  id           text primary key,
  "trailId"    text not null references quest_trails(id) on delete cascade,
  "eventId"    text not null references events(id),
  "orderIndex" int not null,
  unique ("trailId", "orderIndex")
);
create index if not exists idx_quest_trail_steps_trail on quest_trail_steps("trailId");

-- One row per player per trail; the unique pair is what stops a trail's
-- bonus being paid twice (see POST /trails/:id/progress).
create table if not exists user_quest_progress (
  id             text primary key,
  "userId"       uuid not null references users(id) on delete cascade,
  "trailId"      text not null references quest_trails(id) on delete cascade,
  "currentStep"  int not null default 0,
  "completedAt"  timestamptz,
  unique ("userId", "trailId")
);
create index if not exists idx_user_quest_progress_user on user_quest_progress("userId");

grant usage on schema public to anon, authenticated, service_role;
-- ── forge RPC functions ────────────────────────────────────────────────
-- Called only by the backend (routes/forge.ts) with the logged-in player's
-- id. Each runs as one transaction and locks the rows it reads (FOR
-- UPDATE), so a double tap can't spend the same copies or Essence twice.

-- Atomic scrap: consumes one duplicate copy, credits Essence by rarity.
create or replace function forge_scrap(
  p_inventory_id text,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_rarity text;
  v_essence_gained int;
  v_essence_balance int;
  v_remaining_qty int;
begin
  select c.rarity, uc.quantity
  into v_rarity, v_remaining_qty
  from user_cards uc
  join cards c on c.id = uc."cardId"
  where uc.id = p_inventory_id and uc."userId" = p_user_id
  for update of uc;

  if not found then
    return jsonb_build_object('success', false, 'error_msg', 'Card not found in your inventory');
  end if;

  if v_remaining_qty < 2 then
    return jsonb_build_object('success', false, 'error_msg', 'Need at least 2 copies to scrap one');
  end if;

  -- Essence by rarity (cards.rarity is Common | Rare | Epic | Legendary).
  v_essence_gained := case lower(v_rarity)
    when 'common' then 5
    when 'rare' then 25
    when 'epic' then 35
    when 'legendary' then 50
    else 5
  end;

  update user_cards set quantity = quantity - 1 where id = p_inventory_id;
  v_remaining_qty := v_remaining_qty - 1;

  update users
  set "essenceBalance" = "essenceBalance" + v_essence_gained,
      "updatedAt" = now()
  where id = p_user_id
  returning "essenceBalance" into v_essence_balance;

  return jsonb_build_object(
    'success', true,
    'essence_gained', v_essence_gained,
    'essence_balance', v_essence_balance,
    'remaining_quantity', v_remaining_qty
  );
end;
$$;

-- Atomic upgrade: consumes 2 duplicates + 100 Essence, +5 to every stat
-- bonus, +1 level.
create or replace function forge_upgrade(
  p_inventory_id text,
  p_user_id uuid
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_essence_cost int := 100;
  v_essence_balance int;
  v_quantity int;
  v_new_level int;
  v_new_qty int;
begin
  select "essenceBalance" into v_essence_balance from users where id = p_user_id for update;
  if v_essence_balance is null or v_essence_balance < v_essence_cost then
    return jsonb_build_object('success', false, 'error_msg', 'Not enough Essence');
  end if;

  select quantity into v_quantity
  from user_cards
  where id = p_inventory_id and "userId" = p_user_id
  for update;

  if not found then
    return jsonb_build_object('success', false, 'error_msg', 'Card not found in your inventory');
  end if;
  if v_quantity < 3 then
    return jsonb_build_object('success', false, 'error_msg', 'Need at least 3 copies to upgrade');
  end if;

  update users
  set "essenceBalance" = "essenceBalance" - v_essence_cost,
      "updatedAt" = now()
  where id = p_user_id
  returning "essenceBalance" into v_essence_balance;

  update user_cards
  set quantity = quantity - 2,
      level = level + 1,
      "attackBonus" = "attackBonus" + 5,
      "defenseBonus" = "defenseBonus" + 5,
      "speedBonus" = "speedBonus" + 5,
      "brainsBonus" = "brainsBonus" + 5
  where id = p_inventory_id
  returning level, quantity into v_new_level, v_new_qty;

  return jsonb_build_object(
    'success', true,
    'essence_balance', v_essence_balance,
    'new_level', v_new_level,
    'new_quantity', v_new_qty
  );
end;
$$;

-- Only the backend (service_role) may call these — they take the player's
-- id as an argument, so anyone else calling them could act as any player.
revoke execute on function forge_scrap(text, uuid) from public, anon, authenticated;
revoke execute on function forge_upgrade(text, uuid) from public, anon, authenticated;
grant execute on function forge_scrap(text, uuid) to service_role;
grant execute on function forge_upgrade(text, uuid) to service_role;

-- Only the backend talks to these tables. It uses the service-role key,
-- which bypasses RLS; the browser only ever gets the public anon key (for
-- Supabase Auth), so anon/authenticated get NO table or function access and
-- RLS is on everywhere with no policies. Granting them "all" (as this file
-- used to) let anyone with the anon key — it ships in the frontend — write
-- straight to users, user_cards etc. and skip every backend check.
-- See migrations/2026-09-29-lock-down-direct-access.sql.
grant all on all tables in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant all on all routines in schema public to service_role;
revoke all on all tables in schema public from anon, authenticated;
revoke all on all sequences in schema public from anon, authenticated;
revoke execute on all functions in schema public from public, anon, authenticated;

do $$
declare t record;
begin
  for t in select tablename from pg_tables where schemaname = 'public' loop
    execute format('alter table public.%I enable row level security', t.tablename);
  end loop;
end $$;

-- Same for anything added later, without re-running this by hand.
alter default privileges in schema public grant all on tables to service_role;
alter default privileges in schema public grant all on sequences to service_role;
alter default privileges in schema public grant all on routines to service_role;
alter default privileges in schema public revoke all on tables from anon, authenticated;
alter default privileges in schema public revoke all on sequences from anon, authenticated;
alter default privileges in schema public revoke execute on functions from public, anon, authenticated;

-- Nudge PostgREST to pick up the new tables/grants immediately rather than
-- waiting for its next automatic schema-cache refresh.
notify pgrst, 'reload schema';
