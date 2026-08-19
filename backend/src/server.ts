import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { randomUUID } from 'crypto';
import { supabase } from './db/supabaseClient.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, { cors: { origin: '*', methods: ['GET', 'POST'] } });
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB cap
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', service: 'Wits Quest API (Supabase)', timestamp: new Date().toISOString() });
});

app.use('/api', authRoutes);

// ================== CARDS ==================

app.get('/api/cards', async (req, res) => {
  const { data, error } = await supabase.from('cards').select('*').order('id', { ascending: false });
  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? []);
});

app.post('/api/cards', async (req, res) => {
  const { name, category, rarity, baseAttack, baseDefense, baseSpeed, baseBrains, imageUrl, landmarkId } = req.body;
  if (!name || !category || !rarity) {
    return res.status(400).json({ error: 'name, category and rarity are required' });
  }

  const attack = baseAttack ?? 0;
  const defense = baseDefense ?? 0;
  const speed = baseSpeed ?? 0;
  const brains = baseBrains ?? 0;

  const { data, error } = await supabase
    .from('cards')
    .insert({
      id: randomUUID(),
      name,
      category,
      rarity,
      baseAttack: attack,
      baseDefense: defense,
      baseSpeed: speed,
      baseBrains: brains,
      totalStats: attack + defense + speed + brains,
      imageUrl: imageUrl ?? null,
      landmarkId: landmarkId ?? null,
    })
    .select()
    .single();

  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

app.post('/api/cards/upload', upload.single('image'), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: 'No image file provided' });

  const ext = req.file.originalname.split('.').pop() || 'jpg';
  const fileName = `${randomUUID()}.${ext}`;

  const { error: uploadError } = await supabase.storage
    .from('card-images')
    .upload(fileName, req.file.buffer, {
      contentType: req.file.mimetype,
      upsert: false,
    });

  if (uploadError) return res.status(400).json({ error: uploadError.message });

  const { data: publicUrlData } = supabase.storage.from('card-images').getPublicUrl(fileName);

  res.status(201).json({ imageUrl: publicUrlData.publicUrl });
});

// ================== USERS' OWNED CARDS ==================

app.get('/api/users/:id/cards', async (req, res) => {
  const { data: owned, error: ownedErr } = await supabase
    .from('user_cards')
    .select('*')
    .eq('userId', req.params.id);

  if (ownedErr) return res.status(500).json({ error: ownedErr.message });
  if (!owned || owned.length === 0) return res.json([]);

  const cardIds = [...new Set(owned.map((r: any) => r.cardId))];
  const { data: cards, error: cardsErr } = await supabase.from('cards').select('*').in('id', cardIds);
  if (cardsErr) return res.status(500).json({ error: cardsErr.message });

  const cardById = new Map((cards ?? []).map((c: any) => [c.id, c]));

  const shaped = owned
    .map((row: any) => {
      const card = cardById.get(row.cardId);
      if (!card) return null;
      return {
        inventoryId: row.id,
        cardId: card.id,
        name: card.name,
        category: card.category,
        rarity: card.rarity,
        baseAttack: card.baseAttack,
        baseDefense: card.baseDefense,
        baseSpeed: card.baseSpeed,
        baseBrains: card.baseBrains,
        attack: card.baseAttack + (row.attackBonus ?? 0),
        defense: card.baseDefense + (row.defenseBonus ?? 0),
        speed: card.baseSpeed + (row.speedBonus ?? 0),
        brains: card.baseBrains + (row.brainsBonus ?? 0),
        totalStats:
          card.baseAttack + (row.attackBonus ?? 0) +
          card.baseDefense + (row.defenseBonus ?? 0) +
          card.baseSpeed + (row.speedBonus ?? 0) +
          card.baseBrains + (row.brainsBonus ?? 0),
        imageUrl: card.imageUrl,
        level: row.level,
        quantity: row.quantity,
      };
    })
    .filter(Boolean);

  res.json(shaped);
});

// ================== EVENTS ==================

app.get('/api/events', async (req, res) => {
  let query = supabase.from('events').select('*').order('createdAt', { ascending: false });
  if (req.query.active !== undefined) query = query.eq('active', req.query.active === 'true' ? 1 : 0);
  const { data, error } = await query;
  if (error) return res.status(500).json({ error: error.message });
  res.json(data ?? []);
});

app.post('/api/events', async (req, res) => {
  const { name, lat, lng, radius, startDate, endDate, active, cardReward, xpAward, essenceAward } = req.body;
  if (!name || lat === undefined || lng === undefined) {
    return res.status(400).json({ error: 'name, lat and lng are required' });
  }
  const { data, error } = await supabase
    .from('events')
    .insert({
      id: randomUUID(),
      name, lat, lng,
      radius: radius ?? 25,
      startDate: startDate ?? null,
      endDate: endDate ?? null,
      active: active === false ? 0 : 1,
      cardReward: cardReward || null,
      xpAward: xpAward ?? 100,
      essenceAward: essenceAward ?? 50,
      createdAt: new Date().toISOString(),
    })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

app.put('/api/events/:id', async (req, res) => {
  const { name, lat, lng, radius, startDate, endDate, active, cardReward, xpAward, essenceAward } = req.body;
  const update: any = {};
  if (name !== undefined) update.name = name;
  if (lat !== undefined) update.lat = lat;
  if (lng !== undefined) update.lng = lng;
  if (radius !== undefined) update.radius = radius;
  if (startDate !== undefined) update.startDate = startDate;
  if (endDate !== undefined) update.endDate = endDate;
  if (active !== undefined) update.active = active ? 1 : 0;
  if (cardReward !== undefined) update.cardReward = cardReward || null;
  if (xpAward !== undefined) update.xpAward = xpAward;
  if (essenceAward !== undefined) update.essenceAward = essenceAward;

  const { data, error } = await supabase.from('events').update(update).eq('id', req.params.id).select().single();
  if (error) return res.status(400).json({ error: error.message });
  res.json(data);
});

app.delete('/api/events/:id', async (req, res) => {
  const { error } = await supabase.from('events').delete().eq('id', req.params.id);
  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, id: req.params.id });
});

// ================== EVENT TRIVIA ==================

// Fetch the question for an event — answers withheld from the response.
app.get('/api/events/:id/trivia', async (req, res) => {
  const { data, error } = await supabase
    .from('trivia_questions')
    .select('id, eventId, question, questionType, options')
    .eq('eventId', req.params.id)
    .maybeSingle();

  if (error) return res.status(500).json({ error: error.message });
  if (!data) return res.status(404).json({ error: 'No trivia question set for this event' });
  res.json(data);
});

// Admin authoring: create or replace the question for an event.
app.post('/api/events/:id/trivia', async (req, res) => {
  const { question, questionType, options, correctIndex, acceptedAnswers } = req.body;
  if (!question || !questionType) {
    return res.status(400).json({ error: 'question and questionType are required' });
  }
  if (questionType === 'mc' && (correctIndex === undefined || !Array.isArray(options))) {
    return res.status(400).json({ error: 'mc questions require options[] and correctIndex' });
  }
  if (questionType === 'text' && !Array.isArray(acceptedAnswers)) {
    return res.status(400).json({ error: 'text questions require acceptedAnswers[]' });
  }

  const { data: existing } = await supabase
    .from('trivia_questions')
    .select('id')
    .eq('eventId', req.params.id)
    .maybeSingle();

  const payload = {
    eventId: req.params.id,
    question,
    questionType,
    options: questionType === 'mc' ? options : null,
    correctIndex: questionType === 'mc' ? correctIndex : null,
    acceptedAnswers: questionType === 'text' ? acceptedAnswers : null,
  };

  if (existing) {
    const { data, error } = await supabase
      .from('trivia_questions')
      .update(payload)
      .eq('id', existing.id)
      .select()
      .single();
    if (error) return res.status(400).json({ error: error.message });
    return res.json(data);
  }

  const { data, error } = await supabase
    .from('trivia_questions')
    .insert({ id: randomUUID(), ...payload, createdAt: new Date().toISOString() })
    .select()
    .single();
  if (error) return res.status(400).json({ error: error.message });
  res.status(201).json(data);
});

// Submit an answer — checked server-side, awards card + XP on correct.
app.post('/api/events/:id/answer', async (req, res) => {
  const { userId, selectedIndex, textAnswer } = req.body;
  if (!userId) return res.status(400).json({ error: 'userId is required' });

  const { data: qRow, error: qErr } = await supabase
    .from('trivia_questions')
    .select('*')
    .eq('eventId', req.params.id)
    .maybeSingle();
  if (qErr) return res.status(500).json({ error: qErr.message });
  if (!qRow) return res.status(404).json({ error: 'No trivia question set for this event' });

  const { data: eventRow, error: eventErr } = await supabase
    .from('events')
    .select('*')
    .eq('id', req.params.id)
    .single();
  if (eventErr) return res.status(500).json({ error: eventErr.message });

  let correct = false;
  if (qRow.questionType === 'mc') {
    correct = selectedIndex === qRow.correctIndex;
  } else {
    const normalized = (textAnswer ?? '').trim().toLowerCase();
    const accepted: string[] = qRow.acceptedAnswers ?? [];
    correct = accepted.some((a) => a.trim().toLowerCase() === normalized);
  }

  if (!correct) {
    return res.json({ correct: false });
  }

  const xpAwarded = eventRow.xpAward ?? 100;
  const essenceAwarded = eventRow.essenceAward ?? 50;
  let awardedCard = null;

  if (eventRow.cardReward) {
    const { data: existingOwned } = await supabase
      .from('user_cards')
      .select('*')
      .eq('userId', userId)
      .eq('cardId', eventRow.cardReward)
      .maybeSingle();

    if (existingOwned) {
      await supabase
        .from('user_cards')
        .update({ quantity: existingOwned.quantity + 1 })
        .eq('id', existingOwned.id);
    } else {
      await supabase.from('user_cards').insert({
        id: randomUUID(),
        userId,
        cardId: eventRow.cardReward,
        level: 1,
        attackBonus: 0,
        defenseBonus: 0,
        speedBonus: 0,
        brainsBonus: 0,
        quantity: 1,
        acquiredAt: new Date().toISOString(),
      });
    }

    const { data: cardData } = await supabase.from('cards').select('*').eq('id', eventRow.cardReward).single();
    awardedCard = cardData ?? null;
  }

  const { data: userRow } = await supabase.from('users').select('*').eq('id', userId).single();
  if (userRow) {
    await supabase
      .from('users')
      .update({
        currentXP: (userRow.currentXP ?? 0) + xpAwarded,
        totalXP: (userRow.totalXP ?? 0) + xpAwarded,
        essenceBalance: (userRow.essenceBalance ?? 0) + essenceAwarded,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', userId);
  }

  res.json({ correct: true, card: awardedCard, xpAwarded, essenceAwarded });
});

// ================== SOCKETS ==================

import { setupBattleSocketHandler } from './services/battleSocketHandler.js';
setupBattleSocketHandler(io);
io.on('connection', (socket) => console.log(`[Socket.io] Player connected: ${socket.id}`));

httpServer.listen(PORT, () => console.log(`Wits Quest Backend running on http://localhost:${PORT}`));