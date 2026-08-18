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
import { supabase } from '../db/supabaseClient.js';

const router = Router();

// Student email must be exactly 7 digits followed by @students.wits.ac.za
// Admin email must be @wits.ac.za
const STUDENT_EMAIL_REGEX = /^\d{7}@students\.wits\.ac\.za$/;
const ADMIN_EMAIL_REGEX = /^[a-zA-Z0-9._%+-]+@wits\.ac\.za$/;

// ─── REGISTER ──────────────────────────────────────────────────────
router.post('/auth/register', async (req: Request, res: Response) => {
  try {
    const { email, password, name } = req.body;

    // Validation
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required' });
      return;
    }
    const isStudent = STUDENT_EMAIL_REGEX.test(email);
    const isAdmin = ADMIN_EMAIL_REGEX.test(email);
    
    if (!isStudent && !isAdmin) {
      res.status(400).json({ error: 'Email must be a valid @students.wits.ac.za or @wits.ac.za address' });
      return;
    }
    if (password.length < 6) {
      res.status(400).json({ error: 'Password must be at least 6 characters' });
      return;
    }

    // Check for duplicate email
    const { data: existing, error: checkErr } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) {
      res.status(409).json({ error: 'An account with this email already exists' });
      return;
    }

    // Create user
    const id = `usr_${randomUUID().slice(0, 8)}`;
    const username = name ? name.replace(/\s+/g, '_') : email.split('@')[0];
    const passwordHash = await bcrypt.hash(password, 10);
    const now = new Date().toISOString();
    // If admin, generate a dummy student number since the DB requires it
    const stuNum = isStudent ? email.split('@')[0] : `ADM-${Date.now().toString().slice(-6)}`;
    const role = isAdmin ? 'ADMIN' : 'STUDENT';

    const { error: insertUserErr } = await supabase.from('users').insert({
      id, email, studentNumber: stuNum, username, passwordHash, role,
      level: 1, currentXP: 0, totalXP: 0, essenceBalance: 100, dailyStreakCount: 1,
      lastCheckInDate: now, streakMultiplier: 1.0, eloRating: 1000, divisionTier: 'GOLD',
      pvpWins: 0, pvpLosses: 0, pvpDraws: 0, maxStatBudget: 300, legendaryCap: 1, avatar: 'owl',
      createdAt: now, updatedAt: now
    });
    if (insertUserErr) throw insertUserErr;

    // Seed starter cards (Witsie Card, Wits Number 1 in Africa, Smart Card)
    const starterCards = ['card-005', 'card-006', 'card-007'];
    const userCardsToInsert = starterCards.map(cardId => ({
      id: `inv_${id}_${cardId}`,
      userId: id,
      cardId,
      level: 1, attackBonus: 0, defenseBonus: 0, speedBonus: 0, brainsBonus: 0,
      quantity: 1, acquiredAt: now
    }));
    const { error: cardsErr } = await supabase.from('user_cards').insert(userCardsToInsert);
    if (cardsErr) throw cardsErr;

    // Create default deck
    const deckCardIds = ['card-005', 'card-006', 'card-007'];
    let totalCost = 0;
    
    const { data: cardsInfo } = await supabase.from('cards').select('id, totalStats').in('id', deckCardIds);
    if (cardsInfo) {
      for (const c of cardsInfo) {
        totalCost += c.totalStats;
      }
    }

    const deckId = `deck_default_${id}`;
    const { error: deckErr } = await supabase.from('user_decks').insert({
      id: deckId, userId: id, deckName: 'Starter Deck', cardIds: deckCardIds, 
      totalStatCost: totalCost, isDefault: true, createdAt: now, updatedAt: now
    });
    if (deckErr) throw deckErr;

    // Issue JWT
    const token = signToken(id);

    // Fetch the full user row to return
    const { data: user } = await supabase.from('users').select('*').eq('id', id).single();

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
    const { data: user, error: userErr } = await supabase.from('users').select('*').eq('email', email).single();
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
router.get('/auth/me', authMiddleware, async (req: Request, res: Response) => {
  const { data: user } = await supabase.from('users').select('*').eq('id', req.userId).single();
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json({ user });
});

// ─── LIST ALL USERS ────────────────────────────────────────────────
router.get('/users', async (_req: Request, res: Response) => {
  const { data: users } = await supabase.from('users').select('*');
  res.json(users || []);
});

// ─── GET USER BY ID ────────────────────────────────────────────────
router.get('/users/:id', async (req: Request, res: Response) => {
  const { data: user } = await supabase.from('users').select('*').eq('id', req.params.id).single();
  if (!user) {
    res.status(404).json({ error: 'User not found' });
    return;
  }
  res.json(user);
});

// ─── LIST ALL CARDS ────────────────────────────────────────────────
router.get('/cards', async (_req: Request, res: Response) => {
  const { data: cards } = await supabase.from('cards').select('*');
  res.json(cards || []);
});

// ─── GET USER CARD INVENTORY ───────────────────────────────────────
router.get('/users/:id/cards', async (req: Request, res: Response) => {
  // Using Supabase foreign key join
  const { data: cards, error } = await supabase
    .from('user_cards')
    .select(`
      *,
      cards (
        name, category, rarity, baseAttack, baseDefense, baseSpeed, baseBrains, totalStats, imageUrl
      )
    `)
    .eq('userId', req.params.id);
    
  if (error || !cards) {
    res.json([]);
    return;
  }
  
  // Flatten for frontend structure expectation
  const flattened = cards.map(c => {
    const cardInfo = Array.isArray(c.cards) ? c.cards[0] : c.cards;
    return {
      ...c,
      ...cardInfo
    };
  });
  
  res.json(flattened);
});

// ─── GET USER DECKS ────────────────────────────────────────────────
router.get('/users/:id/decks', async (req: Request, res: Response) => {
  const { data: decks } = await supabase.from('user_decks').select('*').eq('userId', req.params.id);
  // No need to parse JSON cardIds as Supabase handles JSONB natively
  res.json(decks || []);
});

// ─── UPDATE USER (for battle results, XP, etc.) ───────────────────
router.put('/users/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  const fields = req.body;

  const allowedFields = [
    'level', 'currentXP', 'totalXP', 'essenceBalance', 'dailyStreakCount',
    'lastCheckInDate', 'streakMultiplier', 'eloRating', 'divisionTier',
    'pvpWins', 'pvpLosses', 'pvpDraws', 'maxStatBudget', 'legendaryCap', 'username', 'avatar',
  ];
  
  const updates: Record<string, any> = {};
  for (const key of allowedFields) {
    if (fields[key] !== undefined) {
      updates[key] = fields[key];
    }
  }
  
  if (Object.keys(updates).length === 0) {
    res.status(400).json({ error: 'No valid fields to update' });
    return;
  }
  updates.updatedAt = new Date().toISOString();

  const { error } = await supabase.from('users').update(updates).eq('id', id);
  if (error) {
    res.status(500).json({ error: 'Failed to update user', detail: error.message });
    return;
  }

  const { data: updated } = await supabase.from('users').select('*').eq('id', id).single();
  res.json(updated);
});

// ─── SAVE BATTLE RESULT ───────────────────────────────────────────
router.post('/battle/result', async (req: Request, res: Response) => {
  try {
    const { userId, matchType, opponentId, outcome, xpAwarded, essenceAwarded, eloDelta, roundsData } = req.body;

    // Insert match record
    const matchId = `match_${randomUUID().slice(0, 8)}`;
    const winnerId = outcome === 'win' ? userId : outcome === 'lose' ? opponentId : 'DRAW';

    await supabase.from('battle_matches').insert({
      id: matchId, matchType, challengerId: userId, opponentId, winnerId,
      roundsWonChallenger: 0, roundsWonOpponent: 0, xpAwarded, essenceAwarded, eloChange: eloDelta, 
      roundsData: roundsData || [], createdAt: new Date().toISOString()
    });

    // Update user stats
    const { data: user } = await supabase.from('users').select('*').eq('id', userId).single();
    if (user) {
      const newTotalXP = Math.max(0, (user.totalXP as number) + xpAwarded);
      let newCurrentXP = Math.max(0, (user.currentXP as number) + xpAwarded);
      let newLevel = user.level as number;

      let target = newLevel * 200;
      while (newCurrentXP >= target) {
        newCurrentXP -= target;
        newLevel += 1;
        target = newLevel * 200;
      }

      const newElo = Math.max(0, (user.eloRating as number) + eloDelta);
      let newDivisionTier = 'BRONZE';
      if (newElo >= 2000) newDivisionTier = 'DIAMOND';
      else if (newElo >= 1500) newDivisionTier = 'PLATINUM';
      else if (newElo >= 1000) newDivisionTier = 'GOLD';
      else if (newElo >= 500) newDivisionTier = 'SILVER';

      const newEssence = Math.max(0, (user.essenceBalance as number) + essenceAwarded);
      const wins = outcome === 'win' ? (user.pvpWins as number) + 1 : user.pvpWins;
      const losses = outcome === 'lose' ? (user.pvpLosses as number) + 1 : user.pvpLosses;
      const draws = outcome === 'tie' ? (user.pvpDraws as number) + 1 : user.pvpDraws;

      await supabase.from('users').update({
        level: newLevel, totalXP: newTotalXP, currentXP: newCurrentXP, 
        eloRating: newElo, divisionTier: newDivisionTier, essenceBalance: newEssence, 
        pvpWins: wins, pvpLosses: losses, pvpDraws: draws, updatedAt: new Date().toISOString()
      }).eq('id', userId);
    }

    const { data: updatedUser } = await supabase.from('users').select('*').eq('id', userId).single();
    res.json({ matchId, user: updatedUser });
  } catch (err: any) {
    console.error('[Battle] Save result error:', err);
    res.status(500).json({ error: 'Failed to save battle result' });
  }
});

// ─── TRIVIA CHECK-IN (from offline queue sync) ─────────────
router.post('/trivia/checkin', async (req: Request, res: Response) => {
  try {
    const { userId, landmarkId, cardId, answer, timestamp } = req.body;

    if (!userId || !cardId) {
      res.status(400).json({ error: 'userId and cardId are required' });
      return;
    }

    // Check if user already owns this card
    const { data: existing } = await supabase.from('user_cards').select('id').eq('userId', userId).eq('cardId', cardId).single();
    
    if (!existing) {
      // Award the card to the user
      const invId = `inv_${userId}_${cardId}_${Date.now()}`;
      const now = timestamp || new Date().toISOString();
      await supabase.from('user_cards').insert({
        id: invId, userId, cardId, level: 1, attackBonus: 0, defenseBonus: 0, speedBonus: 0, brainsBonus: 0, 
        quantity: 1, acquiredAt: now
      });
    }

    // Update lastCheckInDate
    await supabase.from('users').update({
      lastCheckInDate: timestamp || new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }).eq('id', userId);

    console.log(`[Trivia] Check-in synced: user=${userId} card=${cardId} landmark=${landmarkId}`);
    res.json({ status: 'ok', cardId, userId });
  } catch (err: any) {
    console.error('[Trivia] Check-in error:', err);
    res.status(500).json({ error: 'Failed to process trivia check-in' });
  }
});

// ─── GET ALL AVATARS ───────────────────────────────────────────────
router.get('/avatars', async (_req: Request, res: Response) => {
  try {
    const { data: avatars } = await supabase.from('avatars').select('*');
    res.json(avatars || []);
  } catch (err) {
    console.error('[Avatars] GET error:', err);
    res.status(500).json({ error: 'Failed to retrieve avatars' });
  }
});

// ─── ADD NEW AVATAR (Admin) ────────────────────────────────────────
router.post('/avatars', async (req: Request, res: Response) => {
  try {
    const { id, emoji, label, cssClass, description } = req.body;
    if (!id || !emoji || !label || !cssClass || !description) {
      res.status(400).json({ error: 'All fields (id, emoji, label, cssClass, description) are required' });
      return;
    }
    await supabase.from('avatars').insert({
      id, emoji, label, cssClass, description
    });
    
    const { data: newAvatar } = await supabase.from('avatars').select('*').eq('id', id).single();
    res.status(201).json(newAvatar);
  } catch (err: any) {
    console.error('[Avatars] POST error:', err);
    res.status(500).json({ error: 'Failed to create avatar', detail: err.message });
  }
});

export default router;