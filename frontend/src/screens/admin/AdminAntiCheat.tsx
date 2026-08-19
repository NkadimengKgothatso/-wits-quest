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

/** Groups pings per student, oldest first, ready for pairwise comparison. */
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

/** Newest events first. */
function byMostRecent<T extends { to: GpsPing }>(a: T, b: T) {
  return new Date(b.to.timestamp).getTime() - new Date(a.to.timestamp).getTime();
}

/** Movement between consecutive pings that exceeds the speed threshold. */
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

/** Instant jumps across large distances. */
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
    month: 'long', day: 'numeric', year: 'numeric',
  });
}

function formatTime(ts: string) {
  return new Date(ts).toLocaleTimeString('en-ZA', {
    hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false,
  });
}

function actionLabel(action: ActionTaken) {
  return action === 'warned' ? 'Warning Issued'
    : action === 'suspended' ? 'Account Suspended'
    : 'Marked False Positive';
}

const HEADER_CELL: React.CSSProperties = {
  textAlign: 'left', padding: '8px 10px', fontSize: 10,
  fontWeight: 800, color: '#dca668',
  textTransform: 'uppercase', letterSpacing: '0.05em',
};

const SECTION_TITLE: React.CSSProperties = {
  fontSize: 12, fontWeight: 800, color: '#e8c99a', marginBottom: 4,
  letterSpacing: '0.05em', textTransform: 'uppercase',
};

const EMPTY_STATE: React.CSSProperties = {
  fontSize: 12, color: '#dca668', padding: 20, textAlign: 'center',
};

/* ── Shared cells ── */

/** Student name in bold with email beneath — shared by all tables. */
function StudentCell({ student, fallback }: { student?: MockUser; fallback: string }) {
  return (
    <>
      <div style={{ fontSize: 14, fontWeight: 900, color: 'white', marginBottom: 2 }}>
        {student?.name || student?.username || 'Unknown Student'}
      </div>
      <div style={{ fontSize: 11, color: '#dca668' }}>
        {student?.email || fallback}
      </div>
    </>
  );
}

function StatusBadge({ action }: { action: ActionTaken }) {
  return (
    <span style={{
      fontSize: 10, fontWeight: 700, color: '#e8c99a',
      background: 'rgba(220, 166, 104, 0.15)',
      border: '1px solid rgba(220, 166, 104, 0.3)',
      borderRadius: 6, padding: '4px 8px', whiteSpace: 'nowrap',
    }}>
      {actionLabel(action)}
    </span>
  );
}

/**
 * Moderation buttons. Once an action is taken the status is shown instead,
 * with a Change link so an admin can correct a mistake.
 */
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <StatusBadge action={taken} />
        <button
          onClick={() => setEditing(true)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#e8c99a', fontSize: 10, fontWeight: 700,
            textDecoration: 'underline', padding: 0,
          }}>
          Change
        </button>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center' }}>
      <button className="btn-ghost"
        style={{ fontSize: 10, padding: '5px 10px', borderRadius: 6 }}
        onClick={() => choose('warned')}>
        Issue Warning
      </button>
      <button className="btn-peach"
        style={{ fontSize: 10, padding: '5px 10px', borderRadius: 6 }}
        onClick={() => choose('suspended')}>
        Suspend Account
      </button>
      <button className="btn-ghost"
        style={{ fontSize: 10, padding: '5px 10px', borderRadius: 6 }}
        onClick={() => choose('false_positive')}>
        Mark as False Positive
      </button>
      {editing && (
        <button
          onClick={() => setEditing(false)}
          style={{
            background: 'none', border: 'none', cursor: 'pointer',
            color: '#dca668', fontSize: 10, fontWeight: 700,
            textDecoration: 'underline', padding: 0,
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
    // Refresh periodically so new violations appear without a page reload
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);

  async function applyAction(userId: string, incidentId: string, action: ActionTaken) {
    if (!action) return;
    await postAudit(userId, incidentId, action, adminEmail);
    await load();
  }

  // Latest action per account. A later warning or false-positive lifts a suspension,
  // so correcting a mistake restores the student's access.
  const latestByUser = new Map<string, ActionTaken>();
  for (const r of audit) {
    if (!latestByUser.has(r.userId)) latestByUser.set(r.userId, r.action);
  }
  const suspendedUsers = new Set(
    [...latestByUser.entries()].filter(([, a]) => a === 'suspended').map(([id]) => id)
  );

  // Warnings and false-positive marks apply only to the incident they were taken on.
  const actionByIncident = new Map<string, ActionTaken>();
  for (const r of audit) {
    if (r.action === 'suspended' || !r.incidentId) continue;
    if (!actionByIncident.has(r.incidentId)) actionByIncident.set(r.incidentId, r.action);
  }

  /** Suspension is account-level and overrides any per-incident action. */
  function statusFor(userId: string, incidentId: string): ActionTaken {
    if (suspendedUsers.has(userId)) return 'suspended';
    return actionByIncident.get(incidentId) ?? null;
  }

  return (
    <div style={{ padding: 16, minHeight: 'calc(100vh - 120px)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: '0 0 4px' }}>
            Anti-Cheat Telemetry Console
          </h2>
          <p style={{ fontSize: 12, color: '#dca668', margin: '0 0 20px' }}>
            Movement verification and student audit records
          </p>
        </div>
        <button className="btn-ghost"
          style={{ fontSize: 10, padding: '6px 12px', borderRadius: 6 }}
          onClick={load}>
          Refresh
        </button>
      </div>

      {/* ── Table 1: Flagged GPS Speed Violations ── */}
      <div className="glass-dark" style={{ borderRadius: 12, padding: 14 }}>
        <div style={SECTION_TITLE}>
          Flagged GPS Speed Violations ({violations.length})
        </div>
        <div style={{ fontSize: 10, color: '#dca668', marginBottom: 12 }}>
          Movement exceeding {SPEED_THRESHOLD_MS} m/s — faster than humanly possible
        </div>

        {loading ? (
          <div style={EMPTY_STATE}>Loading telemetry...</div>
        ) : violations.length === 0 ? (
          <div style={EMPTY_STATE}>No speed violations detected.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(220, 166, 104, 0.3)' }}>
                  {['#', 'Student', 'Time', 'Speed (m/s)', 'Actions'].map((h) => (
                    <th key={h} style={HEADER_CELL}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {violations.map((v, idx) => {
                  const taken = statusFor(v.userId, v.id);
                  return (
                    <tr key={v.id} style={{
                      borderBottom: '1px solid rgba(220, 166, 104, 0.1)',
                      opacity: taken === 'false_positive' ? 0.45 : 1,
                    }}>
                      <td style={{ padding: '10px', fontSize: 12, color: '#dca668', fontWeight: 700 }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <StudentCell student={v.student} fallback={v.userId} />
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ fontSize: 12, color: 'white' }}>{formatDate(v.to.timestamp)}</div>
                        <div style={{ fontSize: 10, color: '#dca668' }}>{formatTime(v.to.timestamp)}</div>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <span style={{ fontSize: 13, fontWeight: 900, color: '#dca668' }}>
                          {v.speed.toFixed(1)}
                        </span>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <ActionCell taken={taken} onAction={(a) => applyAction(v.userId, v.id, a)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Table 2: Suspicious Teleport Alerts ── */}
      <div className="glass-dark" style={{ borderRadius: 12, padding: 14, marginTop: 20 }}>
        <div style={SECTION_TITLE}>
          Suspicious Teleport Alerts ({teleports.length})
        </div>
        <div style={{ fontSize: 10, color: '#dca668', marginBottom: 12 }}>
          Jumps over {TELEPORT_MIN_DISTANCE_M}m in under {TELEPORT_MAX_SECONDS}s — position spoofing
        </div>

        {loading ? (
          <div style={EMPTY_STATE}>Loading telemetry...</div>
        ) : teleports.length === 0 ? (
          <div style={EMPTY_STATE}>No teleport events detected.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 780 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(220, 166, 104, 0.3)' }}>
                  {['#', 'Student', 'From', 'To', 'Time', 'Action'].map((h) => (
                    <th key={h} style={HEADER_CELL}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teleports.map((t, idx) => {
                  const taken = statusFor(t.userId, t.id);
                  return (
                    <tr key={t.id} style={{
                      borderBottom: '1px solid rgba(220, 166, 104, 0.1)',
                      opacity: taken === 'false_positive' ? 0.45 : 1,
                    }}>
                      <td style={{ padding: '10px', fontSize: 12, color: '#dca668', fontWeight: 700 }}>
                        {idx + 1}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <StudentCell student={t.student} fallback={t.userId} />
                      </td>
                      <td style={{ padding: '10px', fontSize: 12, color: 'white' }}>
                        {nearestLandmarkName(t.from)}
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ fontSize: 12, color: 'white' }}>{nearestLandmarkName(t.to)}</div>
                        <div style={{ fontSize: 10, color: '#dca668' }}>
                          {Math.round(t.distance)}m in {t.seconds.toFixed(1)}s
                        </div>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <div style={{ fontSize: 12, color: 'white' }}>{formatDate(t.to.timestamp)}</div>
                        <div style={{ fontSize: 10, color: '#dca668' }}>{formatTime(t.to.timestamp)}</div>
                      </td>
                      <td style={{ padding: '10px' }}>
                        <ActionCell taken={taken} onAction={(a) => applyAction(t.userId, t.id, a)} />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ── Table 3: Student Audit Records ── */}
      <div className="glass-dark" style={{ borderRadius: 12, padding: 14, marginTop: 20 }}>
        <div style={SECTION_TITLE}>
          Student Audit Records ({audit.length})
        </div>
        <div style={{ fontSize: 10, color: '#dca668', marginBottom: 12 }}>
          Full history of moderation actions taken against student accounts
        </div>

        {loading ? (
          <div style={EMPTY_STATE}>Loading audit records...</div>
        ) : audit.length === 0 ? (
          <div style={EMPTY_STATE}>No moderation actions recorded.</div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(220, 166, 104, 0.3)' }}>
                  {['#', 'Student', 'Action', 'Admin', 'Time'].map((h) => (
                    <th key={h} style={HEADER_CELL}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {audit.map((r, idx) => (
                  <tr key={r.id} style={{ borderBottom: '1px solid rgba(220, 166, 104, 0.1)' }}>
                    <td style={{ padding: '10px', fontSize: 12, color: '#dca668', fontWeight: 700 }}>
                      {idx + 1}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <StudentCell student={r.student} fallback={r.userId} />
                    </td>
                    <td style={{ padding: '10px' }}>
                      <StatusBadge action={r.action} />
                    </td>
                    <td style={{ padding: '10px', fontSize: 11, color: '#dca668' }}>
                      {r.adminEmail}
                    </td>
                    <td style={{ padding: '10px' }}>
                      <div style={{ fontSize: 12, color: 'white' }}>{formatDate(r.timestamp)}</div>
                      <div style={{ fontSize: 10, color: '#dca668' }}>{formatTime(r.timestamp)}</div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
