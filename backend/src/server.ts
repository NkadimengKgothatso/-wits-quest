import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import telemetryRoutes from './routes/telemetry.js';

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

app.use('/api/mock/telemetry', telemetryRoutes);

// Health Check API Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'Wits Quest API Backend',
    timestamp: new Date().toISOString()
  });
});

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

httpServer.listen(PORT, () => {
  console.log(`Wits Quest Backend API running on http://localhost:${PORT}`);
});
