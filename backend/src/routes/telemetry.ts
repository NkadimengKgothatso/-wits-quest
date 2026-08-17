
// Stores GPS pings from the map so movement speed can be verified.

import { Router } from 'express';

export interface TelemetryPing {
  userId: string;
  lat: number;
  lng: number;
  timestamp: string;
}

// In-memory store for Sprint 1. Swap for PostgreSQL in a later sprint.
const pings: TelemetryPing[] = [];

const MAX_PINGS = 5000; // keep memory bounded

const router = Router();

/** Receives one GPS reading from the client map. */
router.post('/ping', (req, res) => {
  const { userId, lat, lng, timestamp } = req.body ?? {};

  if (!userId || typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ error: 'userId, lat and lng are required' });
  }

  const ping: TelemetryPing = {
    userId,
    lat,
    lng,
    timestamp: timestamp || new Date().toISOString(),
  };

  pings.push(ping);
  if (pings.length > MAX_PINGS) pings.shift();

  res.status(201).json(ping);
});

/** All pings, optionally filtered by user. Oldest first. */
router.get('/pings', (req, res) => {
  const { userId } = req.query;
  const result = userId ? pings.filter((p) => p.userId === userId) : pings;
  res.json(result);
});

export default router;