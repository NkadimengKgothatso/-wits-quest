import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { mockDb } from './services/mockDb.js';
import authRoutes from './routes/auth.js';

dotenv.config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Health Check API Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Wits Quest API Backend (Mock DB Enabled)',
    timestamp: new Date().toISOString()
  });
});

// --- Auth Routes ---
app.use('/api', authRoutes);

// --- MOCK DATABASE REST API ENDPOINTS ---

// 1. Get all mock users
app.get('/api/mock/users', (req, res) => {
  res.json(mockDb.getAllUsers());
});

// 2. Get user by ID
app.get('/api/mock/users/:id', (req, res) => {
  const user = mockDb.getUser(req.params.id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json(user);
});

// 3. Programmatically insert custom mock user
app.post('/api/mock/users', (req, res) => {
  try {
    const user = mockDb.insertUser(req.body);
    res.status(201).json(user);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 4. Get all master cards
app.get('/api/mock/cards', (req, res) => {
  res.json(mockDb.getAllCards());
});

// 5. Programmatically insert custom master card
app.post('/api/mock/cards', (req, res) => {
  try {
    const card = mockDb.insertCard(req.body);
    res.status(201).json(card);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 6. Get user 5-card battle deck
app.get('/api/mock/users/:id/deck', (req, res) => {
  const deckCards = mockDb.getUserFullDeckCards(req.params.id);
  res.json(deckCards);
});

// 7. Save battle result & update user XP, Elo, Essence
app.post('/api/mock/battle/result', (req, res) => {
  try {
    const { userId, matchType, opponentId, outcome, xpAwarded, essenceAwarded, eloDelta, roundsData } = req.body;
    const result = mockDb.recordBattleResult(
      userId,
      matchType,
      opponentId,
      outcome,
      xpAwarded,
      essenceAwarded,
      eloDelta,
      roundsData || []
    );
    res.json(result);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 8. Get user async challenges
app.get('/api/mock/async/challenges/:userId', (req, res) => {
  const challenges = mockDb.getAsyncChallengesForUser(req.params.userId);
  res.json(challenges);
});

// 9. Create async challenge
app.post('/api/mock/async/challenge', (req, res) => {
  try {
    const { challengerId, defenderId } = req.body;
    const challenge = mockDb.createAsyncChallenge(challengerId, defenderId);
    res.status(201).json(challenge);
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
});

// 10. Clear mock database completely
app.post('/api/mock/clear', (req, res) => {
  mockDb.clearAllData();
  res.json({ message: 'Database completely cleared. 0 cards, 0 users, 0 demo data.' });
});

import { setupBattleSocketHandler } from './services/battleSocketHandler.js';

// Setup Real-Time Battle Socket Handler
setupBattleSocketHandler(io);

// Real-Time WebSocket Battle Events
io.on('connection', (socket) => {
  console.log(`[Socket.io] Player connected: ${socket.id}`);
});

// Bootstrap: start server
function startServer() {
  try {
    httpServer.listen(PORT, () => {
      console.log(`Wits Quest Backend API running on http://localhost:${PORT}`);
      console.log(`Mock DB Endpoints available at http://localhost:${PORT}/api/mock/*`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

startServer();