/**
 * Seed Script — populates the database with initial data using Supabase.
 * 
 * What it does:
 *   1. Inserts the 4 landmark cards from mock_cards.json into `cards`.
 *   2. Creates 7 test student users with bcrypt-hashed passwords.
 *   3. Gives each test user 5 starter cards in `user_cards`.
 *   4. Creates a default 5-card deck in `user_decks` for each user.
 * 
 * Safe to run multiple times — uses upsert to skip duplicates.
 */

import { readFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import bcrypt from 'bcrypt';
import { supabase } from './supabaseClient.js';

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
  const now = new Date().toISOString();

  // ── Step 0: Seed avatars ────────────────────────────────────
  const defaultAvatars = [
    { id: 'owl', emoji: '🦉', label: 'Academic Owl', cssClass: 'avatar-owl', description: 'Wise and floating' },
    { id: 'springbok', emoji: '🦌', label: 'Swift Springbok', cssClass: 'avatar-springbok', description: 'Bouncy explorer' },
    { id: 'lion', emoji: '🦁', label: 'Noble Lion', cssClass: 'avatar-lion', description: 'Pulsing strength' },
    { id: 'falcon', emoji: '🦅', label: 'Clever Falcon', cssClass: 'avatar-falcon', description: 'Tilting intelligence' }
  ];

  console.log('[Seed] Inserting avatars...');
  await supabase.from('avatars').upsert(defaultAvatars);

  // ── Step 1: Seed cards ──────────────────────────────────────
  console.log('[Seed] Inserting cards...');
  const cardsRaw = readFileSync(CARDS_PATH, 'utf-8');
  const cards: Array<{
    id: string; name: string; category: string; rarity: string;
    stats: { attack: number; defense: number; speed: number; brains: number };
    image: string;
  }> = JSON.parse(cardsRaw);

  const cardsToInsert = cards.map(c => ({
    id: c.id, name: c.name, category: c.category, rarity: c.rarity,
    baseAttack: c.stats.attack, baseDefense: c.stats.defense,
    baseSpeed: c.stats.speed, baseBrains: c.stats.brains,
    totalStats: c.stats.attack + c.stats.defense + c.stats.speed + c.stats.brains,
    imageUrl: c.image
  }));

  const { error: cardsErr } = await supabase.from('cards').upsert(cardsToInsert);
  if (cardsErr) throw new Error("Failed to insert cards: " + JSON.stringify(cardsErr));

  // ── Step 2: Seed users (all with password "password123") ────
  console.log('[Seed] Inserting users...');
  const defaultPassword = 'password123';
  const hash = await bcrypt.hash(defaultPassword, 10);

  const usersToInsert = SEED_USERS.map(u => {
    const role = u.email.endsWith('@wits.ac.za') ? 'ADMIN' : 'STUDENT';
    const avatar = u.id === 'usr_sipho' ? 'springbok' : u.id === 'usr_lerato' ? 'lion' : u.id === 'usr_amahle' ? 'falcon' : 'owl';
    
    return {
      id: u.id, email: u.email, studentNumber: u.studentNumber, username: u.username,
      passwordHash: hash, role, level: u.level, currentXP: u.currentXP, totalXP: u.totalXP,
      essenceBalance: u.essenceBalance, dailyStreakCount: u.dailyStreakCount,
      lastCheckInDate: now, streakMultiplier: u.streakMultiplier,
      eloRating: u.eloRating, divisionTier: u.divisionTier,
      pvpWins: u.pvpWins, pvpLosses: u.pvpLosses, pvpDraws: u.pvpDraws,
      maxStatBudget: u.maxStatBudget, legendaryCap: u.legendaryCap, avatar,
      createdAt: now, updatedAt: now
    };
  });

  await supabase.from('users').upsert(usersToInsert);

  // ── Step 3: Give each user starter cards ────────────────────
  console.log('[Seed] Giving starter cards...');
  const userCardsToInsert = [];
  for (const u of SEED_USERS) {
    for (const cardId of STARTER_CARD_IDS) {
      userCardsToInsert.push({
        id: `inv_${u.id}_${cardId}`,
        userId: u.id, cardId, level: 1, attackBonus: 0, defenseBonus: 0,
        speedBonus: 0, brainsBonus: 0, quantity: 1, acquiredAt: now
      });
    }
  }
  await supabase.from('user_cards').upsert(userCardsToInsert);

  // ── Step 4: Create default deck ─────────────────────────────
  console.log('[Seed] Creating default decks...');
  const deckCardIds = ['card-005', 'card-006', 'card-007'];
  let totalCost = 0;
  
  const { data: cardsInfo } = await supabase.from('cards').select('id, totalStats').in('id', deckCardIds);
  if (cardsInfo) {
    for (const c of cardsInfo) {
      totalCost += c.totalStats;
    }
  }

  const decksToInsert = SEED_USERS.map(u => ({
    id: `deck_default_${u.id}`,
    userId: u.id, deckName: 'Starter Deck', cardIds: deckCardIds,
    totalStatCost: totalCost, isDefault: true, createdAt: now, updatedAt: now
  }));

  await supabase.from('user_decks').upsert(decksToInsert);

  console.log('[Seed] Seeding complete!');
}

// Execute if run directly
if (process.argv[1] === fileURLToPath(import.meta.url)) {
  seed()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('[Seed] Error:', err);
      process.exit(1);
    });
}
