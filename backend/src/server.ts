import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import contentRoutes from './routes/content.js';

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
app.use(express.json({ limit: '50mb' }));

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

// --- Content Routes (Cards, Trivia, Events) ---
app.use('/api', contentRoutes);



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
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

startServer();