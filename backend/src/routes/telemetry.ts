import { Router } from 'express';
import { supabase } from '../db/supabaseClient.js';

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

const router = Router();

/* ── Movement telemetry ── */

/** Receives one GPS reading from the client map. */
router.post('/ping', async (req, res) => {
  const { userId, lat, lng, timestamp } = req.body ?? {};

  if (!userId || typeof lat !== 'number' || typeof lng !== 'number') {
    return res.status(400).json({ error: 'userId, lat and lng are required' });
  }

  const pingTime = timestamp || new Date().toISOString();

  const { data, error } = await supabase
    .from('telemetry_pings')
    .insert([
      { user_id: userId, lat, lng, timestamp: pingTime }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error inserting telemetry ping:', error);
    return res.status(500).json({ error: 'Failed to record ping' });
  }

  res.status(201).json({
    userId: data.user_id,
    lat: data.lat,
    lng: data.lng,
    timestamp: data.timestamp
  });
});

/** All pings, optionally filtered by user. Oldest first. */
router.get('/pings', async (req, res) => {
  const { userId } = req.query;
  
  let query = supabase
    .from('telemetry_pings')
    .select('user_id, lat, lng, timestamp')
    .order('timestamp', { ascending: true })
    .limit(5000); // keep response bounded

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching pings:', error);
    return res.status(500).json({ error: 'Failed to fetch pings' });
  }

  const formattedPings = data.map(d => ({
    userId: d.user_id,
    lat: d.lat,
    lng: d.lng,
    timestamp: d.timestamp
  }));

  res.json(formattedPings);
});

/* ── Moderation audit ── */

/**
 * Records a moderation action. The log is append-only: correcting a
 * mistake adds a new record rather than editing the old one, so the
 * full decision history is preserved.
 */
router.post('/audit', async (req, res) => {
  const { userId, incidentId, action, adminEmail } = req.body ?? {};

  if (!userId || !action) {
    return res.status(400).json({ error: 'userId and action are required' });
  }

  const recordId = `audit_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const timestamp = new Date().toISOString();

  const { data, error } = await supabase
    .from('telemetry_audit')
    .insert([
      { 
        id: recordId, 
        user_id: userId, 
        incident_id: incidentId || null, 
        action, 
        admin_email: adminEmail || 'unknown@wits.ac.za', 
        timestamp 
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error inserting audit record:', error);
    return res.status(500).json({ error: 'Failed to record audit action' });
  }

  res.status(201).json({
    id: data.id,
    userId: data.user_id,
    incidentId: data.incident_id,
    action: data.action,
    adminEmail: data.admin_email,
    timestamp: data.timestamp
  });
});

/** All moderation actions, newest first. */
router.get('/audit', async (_req, res) => {
  const { data, error } = await supabase
    .from('telemetry_audit')
    .select('id, user_id, incident_id, action, admin_email, timestamp')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching audit records:', error);
    return res.status(500).json({ error: 'Failed to fetch audit records' });
  }

  const formattedAudit = data.map(d => ({
    id: d.id,
    userId: d.user_id,
    incidentId: d.incident_id,
    action: d.action,
    adminEmail: d.admin_email,
    timestamp: d.timestamp
  }));

  res.json(formattedAudit);
});

/* ── Account status ── */

/**
 * Account status for a single user.
 * Intended for the login flow: reject sign-in when suspended is true.
 */
router.get('/status/:userId', async (req, res) => {
  const { userId } = req.params;
  
  // Get latest action for this user
  const { data, error } = await supabase
    .from('telemetry_audit')
    .select('action')
    .eq('user_id', userId)
    .order('timestamp', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    console.error('Error fetching user status:', error);
    return res.status(500).json({ error: 'Failed to fetch user status' });
  }

  const isSuspended = data?.action === 'suspended';

  res.json({
    userId,
    suspended: isSuspended,
  });
});

/** Every currently suspended account. */
router.get('/suspended', async (_req, res) => {
  // To get currently suspended accounts, we need the latest action for each user.
  // We can just fetch all audit records (or a subset) and compute latest in memory,
  // since this is a mock implementation for now.
  const { data, error } = await supabase
    .from('telemetry_audit')
    .select('user_id, action, timestamp')
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Error fetching suspended users:', error);
    return res.status(500).json({ error: 'Failed to fetch suspended users' });
  }

  const latestByUser = new Map<string, string>();
  for (const record of data) {
    if (!latestByUser.has(record.user_id)) {
      latestByUser.set(record.user_id, record.action);
    }
  }

  const suspended = Array.from(latestByUser.entries())
    .filter(([_, action]) => action === 'suspended')
    .map(([userId]) => userId);

  res.json(suspended);
});

export default router;