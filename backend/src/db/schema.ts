/**
 * Schema Module — creates all 6 database tables.
 * 
 * Tables match the specs in WITS_QUEST_DATABASE_PLAN.md:
 *   users, cards, user_cards, user_decks, battle_matches, async_pvp_challenges
 * 
 * Called once during initDB(). Uses CREATE TABLE IF NOT EXISTS
 * so re-running is safe (idempotent).
 */

import { getDB } from './connection.js';

export function createTables(): void {
  const db = getDB();

  // ─── Table 1: users ──────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id               TEXT PRIMARY KEY,
      email            TEXT UNIQUE NOT NULL,
      studentNumber    TEXT UNIQUE NOT NULL,
      username         TEXT UNIQUE NOT NULL,
      passwordHash     TEXT NOT NULL,
      role             TEXT NOT NULL DEFAULT 'STUDENT',
      level            INTEGER NOT NULL DEFAULT 1,
      currentXP        INTEGER NOT NULL DEFAULT 0,
      totalXP          INTEGER NOT NULL DEFAULT 0,
      essenceBalance   INTEGER NOT NULL DEFAULT 100,
      dailyStreakCount INTEGER NOT NULL DEFAULT 1,
      lastCheckInDate  TEXT NOT NULL,
      streakMultiplier REAL NOT NULL DEFAULT 1.0,
      eloRating        INTEGER NOT NULL DEFAULT 1000,
      divisionTier     TEXT NOT NULL DEFAULT 'GOLD',
      pvpWins          INTEGER NOT NULL DEFAULT 0,
      pvpLosses        INTEGER NOT NULL DEFAULT 0,
      pvpDraws         INTEGER NOT NULL DEFAULT 0,
      maxStatBudget    INTEGER NOT NULL DEFAULT 300,
      legendaryCap     INTEGER NOT NULL DEFAULT 1,
      avatar           TEXT NOT NULL DEFAULT 'owl',
      createdAt        TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt        TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  // ─── Table 2: cards ──────────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS cards (
      id           TEXT PRIMARY KEY,
      name         TEXT NOT NULL,
      category     TEXT NOT NULL,
      rarity       TEXT NOT NULL,
      baseAttack   INTEGER NOT NULL,
      baseDefense  INTEGER NOT NULL,
      baseSpeed    INTEGER NOT NULL,
      baseBrains   INTEGER NOT NULL,
      totalStats   INTEGER NOT NULL,
      imageUrl     TEXT NOT NULL,
      landmarkId   TEXT
    );
  `);

  // ─── Table 3: user_cards ─────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS user_cards (
      id            TEXT PRIMARY KEY,
      userId        TEXT NOT NULL,
      cardId        TEXT NOT NULL,
      level         INTEGER NOT NULL DEFAULT 1,
      attackBonus   INTEGER NOT NULL DEFAULT 0,
      defenseBonus  INTEGER NOT NULL DEFAULT 0,
      speedBonus    INTEGER NOT NULL DEFAULT 0,
      brainsBonus   INTEGER NOT NULL DEFAULT 0,
      quantity      INTEGER NOT NULL DEFAULT 1,
      acquiredAt    TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id),
      FOREIGN KEY (cardId) REFERENCES cards(id)
    );
  `);

  // ─── Table 4: user_decks ─────────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS user_decks (
      id             TEXT PRIMARY KEY,
      userId         TEXT NOT NULL,
      deckName       TEXT NOT NULL,
      cardIds        TEXT NOT NULL,
      totalStatCost  INTEGER NOT NULL,
      isDefault      INTEGER NOT NULL DEFAULT 0,
      createdAt      TEXT NOT NULL DEFAULT (datetime('now')),
      updatedAt      TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (userId) REFERENCES users(id)
    );
  `);

  // ─── Table 5: battle_matches ─────────────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS battle_matches (
      id                   TEXT PRIMARY KEY,
      matchType            TEXT NOT NULL,
      challengerId         TEXT NOT NULL,
      opponentId           TEXT NOT NULL,
      winnerId             TEXT NOT NULL,
      roundsWonChallenger  INTEGER NOT NULL,
      roundsWonOpponent    INTEGER NOT NULL,
      xpAwarded            INTEGER NOT NULL,
      essenceAwarded       INTEGER NOT NULL,
      eloChange            INTEGER NOT NULL,
      roundsData           TEXT NOT NULL,
      createdAt            TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (challengerId) REFERENCES users(id)
    );
  `);

  // ─── Table 6: async_pvp_challenges ───────────────────────────
  db.run(`
    CREATE TABLE IF NOT EXISTS async_pvp_challenges (
      id                  TEXT PRIMARY KEY,
      challengerId        TEXT NOT NULL,
      defenderId          TEXT NOT NULL,
      status              TEXT NOT NULL DEFAULT 'PENDING_DEFENDER_TURN',
      currentRound        INTEGER NOT NULL DEFAULT 1,
      maxRounds           INTEGER NOT NULL DEFAULT 5,
      challengerDeckIds   TEXT NOT NULL DEFAULT '[]',
      defenderDeckIds     TEXT NOT NULL DEFAULT '[]',
      roundsHistory       TEXT NOT NULL DEFAULT '[]',
      defenderTelemetry   TEXT,
      expiresAt           TEXT NOT NULL,
      createdAt           TEXT NOT NULL DEFAULT (datetime('now')),
      FOREIGN KEY (challengerId) REFERENCES users(id),
      FOREIGN KEY (defenderId)   REFERENCES users(id)
    );
  `);


}
