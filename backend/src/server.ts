import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDB } from './db/connection.js';
import { createTables } from './db/schema.js';
import { seed } from './db/seed.js';
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
    service: 'Wits Quest API Backend',
    timestamp: new Date().toISOString()
  });
});

// Auth + User + Card API Routes
app.use('/api', authRoutes);

// Real-Time WebSocket Battle Events
io.on('connection', (socket) => {
  console.log(`[Socket.io] Player connected: ${socket.id}`);

  socket.on('join_battle', (data) => {
    console.log(`[Socket.io] Player ${socket.id} joined match ${data.matchId}`);
    socket.join(data.matchId);
  });

  socket.on('disconnect', () => {
    console.log(`[Socket.io] Player disconnected: ${socket.id}`);
  });
});

// Bootstrap: init DB → create tables → seed → start server
async function startServer() {
  try {
    await initDB();
    createTables();
    await seed();

    httpServer.listen(PORT, () => {
      console.log(`Wits Quest Backend API running on http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('[Server] Failed to start:', err);
    process.exit(1);
  }
}

startServer();
