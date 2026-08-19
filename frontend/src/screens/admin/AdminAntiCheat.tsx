import { useEffect, useState } from 'react';
import { getMockUsers, type MockUser } from '../../services/apiClient';
import { useAuth } from '../../context/AuthContext';
import {
  calculateSpeed,
  haversineDistance,
  isTeleport,
  nearestLandmarkName,
  secondsBetween,
  SPEED_THRESHOLD_MS,
  TELEPORT_MIN_DISTANCE_M,
  TELEPORT_MAX_SECONDS,
  isSpeedViolation,
  type GpsPing,
} from '../../utils/antiCheat';

const BACKEND_URL = 'http://localhost:3000';

type ActionTaken = 'warned' | 'suspended' | 'false_positive' | null;

interface TelemetryPing extends GpsPing {
  userId: string;
}

interface SpeedViolation {
  id: string;
  userId: string;
  student: MockUser | undefined;
  from: GpsPing;
  to: GpsPing;
  speed: number;
}

interface TeleportAlert {
  id: string;
  userId: string;
  student: MockUser | undefined;
  from: GpsPing;
  to: GpsPing;
  distance: number;
  seconds: number;
}

interface AuditRecord {
  id: string;
  userId: string;
  incidentId?: string;
  action: ActionTaken;
  adminEmail: string;
  timestamp: string;
  student?: MockUser;
}

/* ── Data access ── */

async function fetchPings(): Promise<TelemetryPing[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/mock/telemetry/pings`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function fetchAudit(): Promise<AuditRecord[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/mock/telemetry/audit`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

async function postAudit(
  userId: string,
  incidentId: string,
  action: ActionTaken,
  adminEmail: string
) {
  try {
    await fetch(`${BACKEND_URL}/api/mock/telemetry/audit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, incidentId, action, adminEmail }),
    });
  } catch {
    // Audit logging must never block the UI
  }
}

/* ── Detection ── */

function groupByUser(pings: TelemetryPing[]): Map<string, TelemetryPing[]> {
  const byUser = new Map<string, TelemetryPing[]>();
  for (const p of pings) {
    const list = byUser.get(p.userId) ?? [];
    list.push(p);
    byUser.set(p.userId, list);
  }
  for (const list of byUser.values()) {
    list.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }
  return byUser;
}

function byMostRecent<T extends { to: GpsPing }>(a: T, b: T) {
  return new Date(b.to.timestamp).getTime() - new Date(a.to.timestamp).getTime();
}

function findViolations(pings: TelemetryPing[], users: MockUser[]): SpeedViolation[] {
  const violations: SpeedViolation[] = [];
  for (const [userId, userPings] of groupByUser(pings)) {
    for (let i = 1; i < userPings.length; i++) {
      const from = userPings[i - 1];
      const to = userPings[i];
      const speed = calculateSpeed(from, to);
      if (isSpeedViolation(from, to)) {
        violations.push({
          id: `spd_${userId}_${to.timestamp}`,
          userId,
          student: users.find((u) => u.id === userId),
          from,
          to,
          speed,
        });
      }
    }
  }
  return violations.sort(byMostRecent);
}

function findTeleports(pings: TelemetryPing[], users: MockUser[]): TeleportAlert[] {
  const alerts: TeleportAlert[] = [];
  for (const [userId, userPings] of groupByUser(pings)) {
    for (let i = 1; i < userPings.length; i++) {
      const from = userPings[i - 1];
      const to = userPings[i];
      if (isTeleport(from, to)) {
        alerts.push({
          id: `tp_${userId}_${to.timestamp}`,
          userId,
          student: users.find((u) => u.id === userId),
          from,
          to,
          distance: haversineDistance(from, to),
          seconds: secondsBetween(from, to),
        });
      }
    }
  }
  return alerts.sort(byMostRecent);
}

/* ── Formatting ── */

function formatDate(ts: string) {
  return new Date(ts).toLocaleDateString('en-ZA', {
    month: 'short', day: 'numeric',
  });
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-ZA', {
    hour: '2-digit', minute: '2-digit', hour12: false,
  });
}

function actionLabel(action: ActionTaken) {
  return action === 'warned' ? 'Warning Issued'
    : action === 'suspended' ? 'Account Suspended'
    : 'False Positive';
}

const SECTION_TITLE: React.CSSProperties = {
  fontSize: 16, fontWeight: 900, color: 'var(--color-text)', marginBottom: 4,
  letterSpacing: '0.02em', textTransform: 'uppercase',
};

const EMPTY_STATE: React.CSSProperties = {
  fontSize: 14, color: 'var(--color-muted)', padding: 20, textAlign: 'center',
};

const CARD_STYLE: React.CSSProperties = {
  background: 'var(--color-card-bg)',
  border: '1px solid var(--color-border)',
  borderRadius: 16,
  padding: 16,
  marginBottom: 12,
  boxShadow: '0 4px 12px rgba(44, 34, 30, 0.05)',
  display: 'flex',
  flexDirection: 'column',
  gap: 12,
};

/* ── Shared cells ── */

function StudentCell({ student, fallback }: { student?: MockUser; fallback: string }) {
  return (
    <div>
      <div style={{ fontSize: 15, fontWeight: 900, color: 'var(--color-text)', marginBottom: 2 }}>
        {student?.name || student?.username || 'Unknown Student'}
      </div>
      <div style={{ fontSize: 12, color: 'var(--color-muted)' }}>
        {student?.email || fallback}
      </div>
    </div>
  );
}

function StatusBadge({ action }: { action: ActionTaken }) {
  const isSuspended = action === 'suspended';
  const isWarned = action === 'warned';
  return (
    <span style={{
      fontSize: 11, fontWeight: 800,
      color: isSuspended ? '#fff' : isWarned ? 'var(--color-accent)' : 'var(--color-text)',
      background: isSuspended ? '#e8a6a6' : isWarned ? 'rgba(211, 122, 50, 0.15)' : 'var(--color-bg)',
      border: `1px solid ${isSuspended ? '#e8a6a6' : isWarned ? 'rgba(211, 122, 50, 0.3)' : 'var(--color-border)'}`,
      borderRadius: 12, padding: '4px 10px', whiteSpace: 'nowrap',
    }}>
      {actionLabel(action)}
    </span>
  );
}

function ActionCell({
  taken, onAction,
}: {
  taken: ActionTaken;
  onAction: (a: ActionTaken) => void;
}) {
  const [editing, setEditing] = useState(false);

  function choose(action: ActionTaken) {
    onAction(action);
    setEditing(false);
  }

  if (taken && !editing) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
        <StatusBadge action={taken} />
        <button
          onClick={() => setEditing(true)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-muted)', fontSize: 12, fontWeight: 700,
            textDecoration: 'underline', padding: 0,
          }}>
          Change
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 8 }}>
      <button 
        style={{ fontSize: 12, padding: '6px 12px', borderRadius: 20, background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontWeight: 700, cursor: 'pointer' }}
        onClick={() => choose('warned')}>
        Warn
      </button>
      <button 
        style={{ fontSize: 12, padding: '6px 12px', borderRadius: 20, background: '#e8a6a6', border: 'none', color: '#fff', fontWeight: 700, cursor: 'pointer' }}
        onClick={() => choose('suspended')}>
        Suspend
      </button>
      <button 
        style={{ fontSize: 12, padding: '6px 12px', borderRadius: 20, background: 'var(--color-bg)', border: '1px solid var(--color-border)', color: 'var(--color-text)', fontWeight: 700, cursor: 'pointer' }}
        onClick={() => choose('false_positive')}>
        Clear
      </button>
      {editing && (
        <button
          onClick={() => setEditing(false)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: 'var(--color-muted)', fontSize: 12, fontWeight: 700,
            textDecoration: 'underline', padding: 0, marginLeft: 8
          }}>
          Cancel
        </button>
      )}
    </div>
  );
}

/* ── Screen ── */

export default function AdminAntiCheat() {
  const { currentUser } = useAuth();
  const [violations, setViolations] = useState<SpeedViolation[]>([]);
  const [teleports, setTeleports] = useState<TeleportAlert[]>([]);
  const [audit, setAudit] = useState<AuditRecord[]>([]);
  const [loading, setLoading] = useState(true);

  const adminEmail = currentUser?.email || 'unknown@wits.ac.za';

  async function load() {
    setLoading(true);
    const [pings, users, auditRecords] = await Promise.all([
      fetchPings(),
      getMockUsers(),
      fetchAudit(),
    ]);

    setViolations(findViolations(pings, users));
    setTeleports(findTeleports(pings, users));
    setAudit(
      auditRecords.map((r) => ({ ...r, student: users.find((u) => u.id === r.userId) }))
    );
    setLoading(false);
  }

  useEffect(() => {
    load();
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);

  async function applyAction(userId: string, incidentId: string, action: ActionTaken) {
    if (!action) return;
    await postAudit(userId, incidentId, action, adminEmail);
    await load();
  }

  const latestByUser = new Map<string, ActionTaken>();
  for (const r of audit) {
    if (!latestByUser.has(r.userId)) latestByUser.set(r.userId, r.action);
  }
  const suspendedUsers = new Set(
    [...latestByUser.entries()].filter(([, a]) => a === 'suspended').map(([id]) => id)
  );

  const actionByIncident = new Map<string, ActionTaken>();
  for (const r of audit) {
    if (r.action === 'suspended' || !r.incidentId) continue;
    if (!actionByIncident.has(r.incidentId)) actionByIncident.set(r.incidentId, r.action);
  }

  function statusFor(userId: string, incidentId: string): ActionTaken {
    if (suspendedUsers.has(userId)) return 'suspended';
    return actionByIncident.get(incidentId) ?? null;
  }

  return (
    <div style={{ padding: '16px 16px 80px', minHeight: '100vh', background: 'var(--color-bg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
        <div>
          <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-text)', margin: '0 0 4px', fontFamily: 'var(--font-serif)' }}>
            Anti-Cheat
          </h2>
          <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: 0 }}>
            Movement verification & moderation
          </p>
        </div>
        <button 
          style={{ fontSize: 12, padding: '8px 16px', borderRadius: 20, background: 'var(--color-accent)', color: 'white', border: 'none', fontWeight: 800, cursor: 'pointer' }}
          onClick={load}>
          Refresh
        </button>
      </div>

      {/* ── Section 1: GPS Speed Violations ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={SECTION_TITLE}>
          Speed Violations ({violations.length})
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 16 }}>
          Exceeding {SPEED_THRESHOLD_MS} m/s
        </div>

        {loading ? (
          <div style={EMPTY_STATE}>Loading telemetry...</div>
        ) : violations.length === 0 ? (
          <div style={EMPTY_STATE}>No speed violations detected.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {violations.map((v) => {
              const taken = statusFor(v.userId, v.id);
              return (
                <div key={v.id} style={{ ...CARD_STYLE, opacity: taken === 'false_positive' ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <StudentCell student={v.student} fallback={v.userId} />
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-text)' }}>{formatTime(v.to.timestamp)}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{formatDate(v.to.timestamp)}</div>
                    </div>
                  </div>
                  
                  <div style={{ background: 'var(--color-bg)', padding: 12, borderRadius: 12, border: '1px solid var(--color-border)' }}>
                    <div style={{ fontSize: 11, color: 'var(--color-muted)', textTransform: 'uppercase', fontWeight: 800, marginBottom: 4 }}>Detected Speed</div>
                    <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-accent)' }}>
                      {v.speed.toFixed(1)} m/s
                    </div>
                  </div>

                  <ActionCell taken={taken} onAction={(a) => applyAction(v.userId, v.id, a)} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Section 2: Teleport Alerts ── */}
      <div style={{ marginBottom: 32 }}>
        <div style={SECTION_TITLE}>
          Teleport Alerts ({teleports.length})
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 16 }}>
          Jumps over {TELEPORT_MIN_DISTANCE_M}m in under {TELEPORT_MAX_SECONDS}s
        </div>

        {loading ? (
          <div style={EMPTY_STATE}>Loading telemetry...</div>
        ) : teleports.length === 0 ? (
          <div style={EMPTY_STATE}>No teleport events detected.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {teleports.map((t) => {
              const taken = statusFor(t.userId, t.id);
              return (
                <div key={t.id} style={{ ...CARD_STYLE, opacity: taken === 'false_positive' ? 0.6 : 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <StudentCell student={t.student} fallback={t.userId} />
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-text)' }}>{formatTime(t.to.timestamp)}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{formatDate(t.to.timestamp)}</div>
                    </div>
                  </div>

                  <div style={{ background: 'var(--color-bg)', padding: 12, borderRadius: 12, border: '1px solid var(--color-border)', display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
                      <span style={{ color: 'var(--color-muted)' }}>From:</span>
                      <span style={{ color: 'var(--color-text)' }}>{nearestLandmarkName(t.from)}</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700 }}>
                      <span style={{ color: 'var(--color-muted)' }}>To:</span>
                      <span style={{ color: 'var(--color-text)' }}>{nearestLandmarkName(t.to)}</span>
                    </div>
                    <div style={{ marginTop: 4, paddingTop: 8, borderTop: '1px solid var(--color-border)', fontSize: 12, fontWeight: 800, color: 'var(--color-accent)' }}>
                      Jumped {Math.round(t.distance)}m in {t.seconds.toFixed(1)}s
                    </div>
                  </div>

                  <ActionCell taken={taken} onAction={(a) => applyAction(t.userId, t.id, a)} />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ── Section 3: Audit Records ── */}
      <div>
        <div style={SECTION_TITLE}>
          Audit Records ({audit.length})
        </div>
        <div style={{ fontSize: 12, color: 'var(--color-muted)', marginBottom: 16 }}>
          Moderation history
        </div>

        {loading ? (
          <div style={EMPTY_STATE}>Loading audit records...</div>
        ) : audit.length === 0 ? (
          <div style={EMPTY_STATE}>No moderation actions recorded.</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {audit.map((r) => (
              <div key={r.id} style={CARD_STYLE}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <StudentCell student={r.student} fallback={r.userId} />
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-text)' }}>{formatTime(r.timestamp)}</div>
                    <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>{formatDate(r.timestamp)}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 4 }}>
                  <StatusBadge action={r.action} />
                  <span style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 600 }}>By: {r.adminEmail}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
