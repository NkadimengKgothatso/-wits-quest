/**
 * Auth Routes — Register, Login, and Profile endpoints.
 * 
 * POST /api/auth/register  — create new student account (public)
 * POST /api/auth/login     — sign in with email + password (public)
 * GET  /api/auth/me        — get current user profile (protected, needs JWT)
 * 
 * Also includes pass-through routes for the rest of the app:
 * GET  /api/users          — list all users (for leaderboard, matchmaking)
 * GET  /api/users/:id      — get single user by ID
 * GET  /api/cards          — list all cards
 * GET  /api/users/:id/cards — get user's card inventory
 * GET  /api/users/:id/decks — get user's decks
 */

import { Router, type Request, type Response } from 'express';
import { randomUUID } from 'node:crypto';
import bcrypt from 'bcrypt';
import { signToken, authMiddleware } from '../middleware/auth.js';
import { queryAll, queryOne, runAndPersist, getDB, persist } from '../db/connection.js';

const router = Router();

// ─── REGISTER ──────────────────────────────────────────────────────
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name, studentNumber } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    if (!email.endsWith('@students.wits.ac.za') && !email.endsWith('@wits.ac.za')) {
      res.status(400).json({ error: 'Email must be a valid @students.wits.ac.za address' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Check for duplicate email
    const existing = queryOne('SELECT id FROM users WHERE email = ?', [email]);
    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    // Create user
    const id = `usr_${randomUUID().slice(0, 8)}`;
    const username = name ? name.replace(/\s+/g, '_') : email.split('@')[0];
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    const stuNum = studentNumber || `S${Date.now()}`;

    const db = getDB();
    db.run(
      `INSERT INTO users
       (id, email, studentNumber, username, passwordHash, role, level, currentXP, totalXP,
        essenceBalance, dailyStreakCount, lastCheckInDate, streakMultiplier,
        eloRating, divisionTier, pvpWins, pvpLosses, pvpDraws, maxStatBudget, legendaryCap, createdAt, updatedAt)
       VALUES (?, ?, ?, ?, ?, 'STUDENT', 1, 0, 0, 100, 1, ?, 1.0, 1000, 'GOLD', 0, 0, 0, 300, 1, ?, ?)`,
      [id, email, stuNum, username, passwordHash, now, now, now]
    );

    // Seed starter cards
    const starterCards = ['card-001', 'card-002', 'card-003', 'card-004'];
    for (const cardId of starterCards) {
      const invId = `inv_${id}_${cardId}`;
      db.run(
        `INSERT INTO user_cards (id, userId, cardId, level, attackBonus, defenseBonus, speedBonus, brainsBonus, quantity, acquiredAt)
         VALUES (?, ?, ?, 1, 0, 0, 0, 0, 1, ?)`,
        [invId, id, cardId, now]
      );
    }

    // Create default deck
    const deckCardIds = ['card-001', 'card-002', 'card-003', 'card-004', 'card-003'];
    let totalCost = 0;
    for (const cid of deckCardIds) {
      const row = queryOne<{ totalStats: number }>('SELECT totalStats FROM cards WHERE id = ?', [cid]);
      if (row) totalCost += row.totalStats;
    }
    const deckId = `deck_default_${id}`;
    db.run(
      `INSERT INTO user_decks (id, userId, deckName, cardIds, totalStatCost, isDefault, createdAt, updatedAt)
       VALUES (?, ?, 'Starter Deck', ?, ?, 1, ?, ?)`,
      [deckId, id, JSON.stringify(deckCardIds), totalCost, now, now]
    );

    persist();

    // Issue JWT
    const token = signToken(id);

    // Fetch the full user row to return
    const user = queryOne('SELECT * FROM users WHERE id = ?', [id]);

    console.log(`[Auth] Registered new student: ${email} (${id})`);
    res.status(201).json({ token, user });
  } catch (err: any) {
    console.error('[Auth] Register error:', err);
    res.status(500).json({ error: 'Registration failed', detail: err.message });
  }
});

// ─── LOGIN ─────────────────────────────────────────────────────────
router.post('/auth/login', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }

    // Find user by email
    const user = queryOne<Record<string, any>>('SELECT * FROM users WHERE email = ?', [email]);
    if (!user) {
      res.status(401).json({ error: 'No account found for this email' });
      return;
    }

    // Compare password
    const valid = await bcrypt.compare(password, user.passwordHash as string);
    if (!valid) {
      res.status(401).json({ error: 'Incorrect password' });
      return;
    }

    // Issue JWT
    const token = signToken(user.id as string);

    console.log(`[Auth] Login successful: ${email} (${user.id})`);
    res.json({ token, user });
  } catch (err: any) {
    console.error('[Auth] Login error:', err);
    res.status(500).json({ error: 'Login failed', detail: err.message });
  }
});

// ─── GET CURRENT USER (protected) ──────────────────────────────────
router.get('/auth/me', authMiddleware, (req: Request, res: Response) => {
  const user = queryOne('SELECT * FROM users WHERE id = ?', [req.userId]);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user });
});

// ─── LIST ALL USERS ────────────────────────────────────────────────
router.get('/users', (_req: Request, res: Response) => {
  const users = queryAll('SELECT * FROM users');
  res.json(users);
});

// ─── GET USER BY ID ────────────────────────────────────────────────
router.get('/users/:id', (req: Request, res: Response) => {
  const user = queryOne('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
});

// ─── LIST ALL CARDS ────────────────────────────────────────────────
router.get('/cards', (_req: Request, res: Response) => {
  const cards = queryAll('SELECT * FROM cards');
  res.json(cards);
});

// ─── GET USER CARD INVENTORY ───────────────────────────────────────
router.get('/users/:id/cards', (req: Request, res: Response) => {
  const cards = queryAll(
    `SELECT uc.*, c.name, c.category, c.rarity, c.baseAttack, c.baseDefense, c.baseSpeed, c.baseBrains, c.totalStats, c.imageUrl
     FROM user_cards uc
     JOIN cards c ON uc.cardId = c.id
     WHERE uc.userId = ?`,
    [req.params.id]
  );
  res.json(cards);
});

// ─── GET USER DECKS ────────────────────────────────────────────────
router.get('/users/:id/decks', (req: Request, res: Response) => {
  const decks = queryAll('SELECT * FROM user_decks WHERE userId = ?', [req.params.id]);
  // Parse JSON cardIds for the frontend
  const parsed = decks.map((d: any) => ({
    ...d,
    cardIds: typeof d.cardIds === 'string' ? JSON.parse(d.cardIds) : d.cardIds,
  }));
  res.json(parsed);
});

// ─── UPDATE USER (for battle results, XP, etc.) ───────────────────
router.put('/users/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const fields = req.body;

  // Build dynamic UPDATE
  const allowedFields = [
    'level', 'currentXP', 'totalXP', 'essenceBalance', 'dailyStreakCount',
    'lastCheckInDate', 'streakMultiplier', 'eloRating', 'divisionTier',
    'pvpWins', 'pvpLosses', 'pvpDraws', 'maxStatBudget', 'legendaryCap', 'username',
  ];
  const sets: string[] = [];
  const vals: unknown[] = [];
  for (const key of allowedFields) {
    if (fields[key] !== undefined) {
      sets.push(`${key} = ?`);
      vals.push(fields[key]);
    }
  }
  if (sets.length === 0) {
    res.status(400).json({ error: 'No valid fields to update' });
    return;
  }
  sets.push("updatedAt = datetime('now')");
  vals.push(id);

  runAndPersist(`UPDATE users SET ${sets.join(', ')} WHERE id = ?`, vals);

  const updated = queryOne('SELECT * FROM users WHERE id = ?', [id]);
  res.json(updated);
});

// ─── SAVE BATTLE RESULT ───────────────────────────────────────────
router.post('/battle/result', (req: Request, res: Response) => {
  try {
    const { userId, matchType, opponentId, outcome, xpAwarded, essenceAwarded, eloDelta, roundsData } = req.body;

    // Insert match record
    const matchId = `match_${randomUUID().slice(0, 8)}`;
    const winnerId = outcome === 'win' ? userId : outcome === 'lose' ? opponentId : 'DRAW';

    runAndPersist(
      `INSERT INTO battle_matches (id, matchType, challengerId, opponentId, winnerId,
        roundsWonChallenger, roundsWonOpponent, xpAwarded, essenceAwarded, eloChange, roundsData)
       VALUES (?, ?, ?, ?, ?, 0, 0, ?, ?, ?, ?)`,
      [matchId, matchType, userId, opponentId, winnerId, xpAwarded, essenceAwarded, eloDelta, JSON.stringify(roundsData || [])]
    );

    // Update user stats
    const user = queryOne<Record<string, any>>('SELECT * FROM users WHERE id = ?', [userId]);
    if (user) {
      const newTotalXP = Math.max(0, (user.totalXP as number) + xpAwarded);
      const newElo = Math.max(0, (user.eloRating as number) + eloDelta);
      const newEssence = Math.max(0, (user.essenceBalance as number) + essenceAwarded);
      const wins = outcome === 'win' ? (user.pvpWins as number) + 1 : user.pvpWins;
      const losses = outcome === 'lose' ? (user.pvpLosses as number) + 1 : user.pvpLosses;
      const draws = outcome === 'tie' ? (user.pvpDraws as number) + 1 : user.pvpDraws;

      runAndPersist(
        `UPDATE users SET totalXP = ?, eloRating = ?, essenceBalance = ?, pvpWins = ?, pvpLosses = ?, pvpDraws = ?, updatedAt = datetime('now') WHERE id = ?`,
        [newTotalXP, newElo, newEssence, wins, losses, draws, userId]
      );
    }

    const updatedUser = queryOne('SELECT * FROM users WHERE id = ?', [userId]);
    res.json({ matchId, user: updatedUser });
  } catch (err: any) {
    console.error('[Battle] Save result error:', err);
    res.status(500).json({ error: 'Failed to save battle result' });
  }
});

export default router;
