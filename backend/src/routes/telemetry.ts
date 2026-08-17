// Telemetry & Anti-Cheat routes — Member 6 (Kea)
// Stores GPS pings from the map so movement speed can be verified,
// and records moderation actions taken against student accounts.

import { Router } from 'express';

export interface TelemetryPing {
  userId: string;
  lat: number;
  lng: number;
  timestamp: string;
}

export interface AuditRecord {
  id: string;
  userId: string;
  incidentId?: string;
  action: 'warned' | 'suspended' | 'false_positive';
  adminEmail: string;
  timestamp: string;
}

// In-memory stores for Sprint 1. Swap for PostgreSQL in a later sprint.
const pings: TelemetryPing[] = [];
const auditRecords: AuditRecord[] = []; // newest first

const MAX_PINGS = 5000; // keep memory bounded

const router = Router();

/* ── Movement telemetry ── */

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

/* ── Moderation audit ── */

/**
 * Records a moderation action. The log is append-only: correcting a
 * mistake adds a new record rather than editing the old one, so the
 * full decision history is preserved.
 */
router.post('/audit', (req, res) => {
  const { userId, incidentId, action, adminEmail } = req.body ?? {};

  if (!userId || !action) {
    return res.status(400).json({ error: 'userId and action are required' });
  }

  const record: AuditRecord = {
    id: `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    userId,
    incidentId,
    action,
    adminEmail: adminEmail || 'unknown@wits.ac.za',
    timestamp: new Date().toISOString(),
  };

  auditRecords.unshift(record);
  res.status(201).json(record);
});

/** All moderation actions, newest first. */
router.get('/audit', (_req, res) => {
  res.json(auditRecords);
});

/* ── Account status ── */

/** The most recent action taken against each user. */
function latestActionByUser(): Map<string, AuditRecord> {
  const latest = new Map<string, AuditRecord>();

  // auditRecords is newest-first, so the first entry per user is current.
  for (const r of auditRecords) {
    if (!latest.has(r.userId)) latest.set(r.userId, r);
  }

  return latest;
}

/** True if the user's most recent action is a suspension. */
export function isUserSuspended(userId: string): boolean {
  return latestActionByUser().get(userId)?.action === 'suspended';
}

/**
 * Account status for a single user.
 * Intended for the login flow: reject sign-in when suspended is true.
 */
router.get('/status/:userId', (req, res) => {
  res.json({
    userId: req.params.userId,
    suspended: isUserSuspended(req.params.userId),
  });
});

/** Every currently suspended account. */
router.get('/suspended', (_req, res) => {
  const suspended = [...latestActionByUser().values()]
    .filter((r) => r.action === 'suspended')
    .map((r) => r.userId);

  res.json(suspended);
});

export default router;