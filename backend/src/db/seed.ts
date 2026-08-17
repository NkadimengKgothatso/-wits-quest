/**
 * Seed Script — populates the database with initial data.
 * 
 * What it does:
 *   1. Inserts the 4 landmark cards from mock_cards.json into `cards`.
 *   2. Creates 7 test student users with bcrypt-hashed passwords.
 *   3. Gives each test user 5 starter cards in `user_cards`.
 *   4. Creates a default 5-card deck in `user_decks` for each user.
 * 
 * Safe to run multiple times — uses INSERT OR IGNORE to skip duplicates.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import { getDB, persist, queryAll } from './connection.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const CARDS_PATH = resolve(__dirname, '..', '..', '..', 'data', 'mock_cards.json');

// ─── Test user definitions (matches frontend mockDbClient.ts) ────
const SEED_USERS = [
  {
    id: 'usr_kagiso', email: 'kagiso@wits.ac.za', studentNumber: 'ADM-KAGISO',
    username: 'Admin_Kagiso', level: 12, currentXP: 2450, totalXP: 2450,
    essenceBalance: 350, dailyStreakCount: 7, streakMultiplier: 1.2,
    eloRating: 1250, divisionTier: 'GOLD', pvpWins: 34, pvpLosses: 12, pvpDraws: 2,
    maxStatBudget: 350, legendaryCap: 1,
  },
  {
    id: 'usr_thabo', email: 'thabo@students.wits.ac.za', studentNumber: '2591044',
    username: 'Thabo_Engineer', level: 28, currentXP: 48200, totalXP: 48200,
    essenceBalance: 1200, dailyStreakCount: 12, streakMultiplier: 1.5,
    eloRating: 1940, divisionTier: 'DIAMOND', pvpWins: 142, pvpLosses: 28, pvpDraws: 5,
    maxStatBudget: 400, legendaryCap: 2,
  },
  {
    id: 'usr_lesedi', email: 'lesedi@students.wits.ac.za', studentNumber: '2601934',
    username: 'Lesedi_Grandmaster', level: 18, currentXP: 29400, totalXP: 29400,
    essenceBalance: 850, dailyStreakCount: 9, streakMultiplier: 1.3,
    eloRating: 1650, divisionTier: 'PLATINUM', pvpWins: 88, pvpLosses: 34, pvpDraws: 4,
    maxStatBudget: 350, legendaryCap: 1,
  },
  {
    id: 'usr_sipho', email: 'sipho@students.wits.ac.za', studentNumber: '2394821',
    username: 'Sipho_Tactician', level: 8, currentXP: 14200, totalXP: 14200,
    essenceBalance: 400, dailyStreakCount: 4, streakMultiplier: 1.1,
    eloRating: 1420, divisionTier: 'GOLD', pvpWins: 45, pvpLosses: 22, pvpDraws: 1,
    maxStatBudget: 300, legendaryCap: 1,
  },
  {
    id: 'usr_lerato', email: 'lerato@students.wits.ac.za', studentNumber: '2510293',
    username: 'Lerato_Master', level: 25, currentXP: 41550, totalXP: 41550,
    essenceBalance: 980, dailyStreakCount: 7, streakMultiplier: 1.4,
    eloRating: 1850, divisionTier: 'DIAMOND', pvpWins: 118, pvpLosses: 30, pvpDraws: 3,
    maxStatBudget: 400, legendaryCap: 2,
  },
  {
    id: 'usr_amahle', email: 'amahle@students.wits.ac.za', studentNumber: '2491024',
    username: 'Amahle_Explorer', level: 22, currentXP: 34200, totalXP: 34200,
    essenceBalance: 620, dailyStreakCount: 9, streakMultiplier: 1.3,
    eloRating: 1520, divisionTier: 'PLATINUM', pvpWins: 97, pvpLosses: 41, pvpDraws: 6,
    maxStatBudget: 350, legendaryCap: 1,
  },
  {
    id: 'usr_nandi', email: 'nandi@students.wits.ac.za', studentNumber: '2489201',
    username: 'Nandi_Strategist', level: 11, currentXP: 19800, totalXP: 19800,
    essenceBalance: 290, dailyStreakCount: 3, streakMultiplier: 1.0,
    eloRating: 1180, divisionTier: 'GOLD', pvpWins: 62, pvpLosses: 38, pvpDraws: 2,
    maxStatBudget: 350, legendaryCap: 1,
  },
];

// The 3 starter card IDs every new user receives
const STARTER_CARD_IDS = ['card-005', 'card-006', 'card-007'];

export async function seed(): Promise<void> {
  const db = getDB();
  const now = new Date().toISOString();

  // ── Step 1: Seed cards ──────────────────────────────────────
  const cardsRaw = readFileSync(CARDS_PATH, 'utf-8');
  const cards: Array<{
    id: string; name: string; category: string; rarity: string;
    stats: { attack: number; defense: number; speed: number; brains: number };
    image: string;
  }> = JSON.parse(cardsRaw);

  for (const c of cards) {
    const totalStats = c.stats.attack + c.stats.defense + c.stats.speed + c.stats.brains;
    db.run(
      `INSERT OR IGNORE INTO cards (id, name, category, rarity, baseAttack, baseDefense, baseSpeed, baseBrains, totalStats, imageUrl)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [c.id, c.name, c.category, c.rarity, c.stats.attack, c.stats.defense, c.stats.speed, c.stats.brains, totalStats, c.image]
    );
  }


  // ── Step 2: Seed users (all with password "password123") ────
  const defaultPassword = 'password123';
  const hash = await bcrypt.hash(defaultPassword, 10);

  for (const u of SEED_USERS) {
    const role = u.email.endsWith('@wits.ac.za') ? 'ADMIN' : 'STUDENT';
    const avatar = u.id === 'usr_sipho' ? 'springbok' : u.id === 'usr_lerato' ? 'lion' : u.id === 'usr_amahle' ? 'falcon' : 'owl';
    db.run(
      `INSERT OR IGNORE INTO users
       (id, email, studentNumber, username, passwordHash, role, level, currentXP, totalXP,
        essenceBalance, dailyStreakCount, lastCheckInDate, streakMultiplier,
        eloRating, divisionTier, pvpWins, pvpLosses, pvpDraws, maxStatBudget, legendaryCap, avatar, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [u.id, u.email, u.studentNumber, u.username, hash, role, u.level, u.currentXP, u.totalXP,
       u.essenceBalance, u.dailyStreakCount, now, u.streakMultiplier,
       u.eloRating, u.divisionTier, u.pvpWins, u.pvpLosses, u.pvpDraws, u.maxStatBudget, u.legendaryCap, avatar, now, now]
    );
  }


  // ── Step 3: Give each user starter cards ────────────────────
  for (const u of SEED_USERS) {
    for (const cardId of STARTER_CARD_IDS) {
      const invId = `inv_${u.id}_${cardId}`;
      db.run(
        `INSERT OR IGNORE INTO user_cards (id, userId, cardId, level, attackBonus, defenseBonus, speedBonus, brainsBonus, quantity, acquiredAt)
         VALUES (?, ?, ?, 1, 0, 0, 0, 0, 1, ?)`,
        [invId, u.id, cardId, now]
      );
    }
  }


  // Create default deck
  const deckCardIds = ['card-005', 'card-006', 'card-007'];
  // Compute total stat cost from the cards table
  let totalCost = 0;
  for (const cid of deckCardIds) {
    const row = queryAll<{ totalStats: number }>(`SELECT totalStats FROM cards WHERE id = ?`, [cid]);
    if (row[0]) totalCost += row[0].totalStats;
  }

  for (const u of SEED_USERS) {
    const deckId = `deck_default_${u.id}`;
    db.run(
      `INSERT OR IGNORE INTO user_decks (id, userId, deckName, cardIds, totalStatCost, isDefault, createdAt, updatedAt)
       VALUES (?, ?, 'Starter Deck', ?, ?, 1, ?, ?)`,
      [deckId, u.id, JSON.stringify(deckCardIds), totalCost, now, now]
    );
  }


  // Save everything to disk
  persist();

}
