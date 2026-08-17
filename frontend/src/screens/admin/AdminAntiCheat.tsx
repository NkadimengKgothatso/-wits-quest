import { useEffect, useState } from 'react';
import { getMockUsers, type MockUser } from '../../services/mockDbClient';
import { calculateSpeed, SPEED_THRESHOLD_MS, type GpsPing } from '../../utils/antiCheat';

const BACKEND_URL = 'http://localhost:3000';

type ActionTaken = 'warned' | 'suspended' | 'false_positive' | null;

interface TelemetryPing extends GpsPing {
  userId: string;
}

interface SpeedViolation {
  id: string;
  student: MockUser | undefined;
  userId: string;
  from: GpsPing;
  to: GpsPing;
  speed: number;
}

/** Fetch every stored GPS ping from the telemetry endpoint. */
async function fetchPings(): Promise<TelemetryPing[]> {
  try {
    const res = await fetch(`${BACKEND_URL}/api/mock/telemetry/pings`);
    if (!res.ok) return [];
    return await res.json();
  } catch {
    return [];
  }
}

/**
 * Walks each student's pings in time order, measures the speed between
 * consecutive readings, and returns any that exceed the threshold.
 */
function findViolations(pings: TelemetryPing[], users: MockUser[]): SpeedViolation[] {
  // Group pings by student
  const byUser = new Map<string, TelemetryPing[]>();
  for (const p of pings) {
    const list = byUser.get(p.userId) ?? [];
    list.push(p);
    byUser.set(p.userId, list);
  }

  const violations: SpeedViolation[] = [];

  for (const [userId, userPings] of byUser) {
    // Oldest first, so consecutive pairs make sense
    userPings.sort(
      (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
    );

    for (let i = 1; i < userPings.length; i++) {
      const from = userPings[i - 1];
      const to = userPings[i];
      const speed = calculateSpeed(from, to);

      if (speed > SPEED_THRESHOLD_MS) {
        violations.push({
          id: `${userId}_${to.timestamp}`,
          userId,
          student: users.find((u) => u.id === userId),
          from,
          to,
          speed,
        });
      }
    }
  }

  // Most recent violations first
  return violations.sort(
    (a, b) => new Date(b.to.timestamp).getTime() - new Date(a.to.timestamp).getTime()
  );
}

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

export default function AdminAntiCheat() {
  const [violations, setViolations] = useState<SpeedViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [actions, setActions] = useState<Record<string, ActionTaken>>({});

  async function load() {
    setLoading(true);
    const [pings, users] = await Promise.all([fetchPings(), getMockUsers()]);
    setViolations(findViolations(pings, users));
    setLoading(false);
  }

  useEffect(() => {
    load();
    // Refresh every 15s so new violations appear without a page reload
    const timer = setInterval(load, 15000);
    return () => clearInterval(timer);
  }, []);

  function applyAction(id: string, action: ActionTaken) {
    setActions((prev) => ({ ...prev, [id]: action }));
  }

  return (
    <div style={{ padding: 16, minHeight: 'calc(100vh - 120px)' }}>
      <h2 style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: '0 0 4px' }}>
        Anti-Cheat Telemetry Console
      </h2>
      <p style={{ fontSize: 12, color: '#dca668', margin: '0 0 20px' }}>
        Movement verification and student audit records
      </p>

      <div className="glass-dark" style={{ borderRadius: 12, padding: 14 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div style={{
              fontSize: 12, fontWeight: 800, color: '#e8c99a', marginBottom: 4,
              letterSpacing: '0.05em', textTransform: 'uppercase',
            }}>
              Flagged GPS Speed Violations
            </div>
            <div style={{ fontSize: 10, color: '#dca668', marginBottom: 12 }}>
              Movement exceeding {SPEED_THRESHOLD_MS} m/s — faster than humanly possible
            </div>
          </div>
          <button className="btn-ghost"
            style={{ fontSize: 10, padding: '6px 12px', borderRadius: 6 }}
            onClick={load}>
            Refresh
          </button>
        </div>

        {loading ? (
          <div style={{ fontSize: 12, color: '#dca668', padding: 20, textAlign: 'center' }}>
            Loading telemetry...
          </div>
        ) : violations.length === 0 ? (
          <div style={{ fontSize: 12, color: '#dca668', padding: 20, textAlign: 'center' }}>
            No speed violations detected.
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 680 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid rgba(220, 166, 104, 0.3)' }}>
                  {['#', 'Student', 'Time', 'Speed (m/s)', 'Actions'].map((h) => (
                    <th key={h} style={{
                      textAlign: 'left', padding: '8px 10px', fontSize: 10,
                      fontWeight: 800, color: '#dca668',
                      textTransform: 'uppercase', letterSpacing: '0.05em',
                    }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {violations.map((v, idx) => {
                  const taken = actions[v.id];

                  return (
                    <tr key={v.id} style={{
                      borderBottom: '1px solid rgba(220, 166, 104, 0.1)',
                      opacity: taken === 'false_positive' ? 0.45 : 1,
                    }}>
                      <td style={{ padding: '10px', fontSize: 12, color: '#dca668', fontWeight: 700 }}>
                        {idx + 1}
                      </td>

                      <td style={{ padding: '10px' }}>
                        <div style={{ fontSize: 12, fontWeight: 800, color: 'white' }}>
                          {v.student?.name || v.student?.username || 'Unknown Student'}
                        </div>
                        <div style={{ fontSize: 10, color: '#dca668' }}>
                          {v.student?.email || v.userId}
                        </div>
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
                        {taken ? (
                          <span style={{
                            fontSize: 10, fontWeight: 700, color: '#e8c99a',
                            background: 'rgba(220, 166, 104, 0.15)',
                            border: '1px solid rgba(220, 166, 104, 0.3)',
                            borderRadius: 6, padding: '4px 8px',
                          }}>
                            {taken === 'warned' ? 'Warning Issued'
                              : taken === 'suspended' ? 'Account Suspended'
                              : 'Marked False Positive'}
                          </span>
                        ) : (
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            <button className="btn-ghost"
                              style={{ fontSize: 10, padding: '5px 10px', borderRadius: 6 }}
                              onClick={() => applyAction(v.id, 'warned')}>
                              Issue Warning
                            </button>
                            <button className="btn-peach"
                              style={{ fontSize: 10, padding: '5px 10px', borderRadius: 6 }}
                              onClick={() => applyAction(v.id, 'suspended')}>
                              Suspend Account
                            </button>
                            <button className="btn-ghost"
                              style={{ fontSize: 10, padding: '5px 10px', borderRadius: 6 }}
                              onClick={() => applyAction(v.id, 'false_positive')}>
                              Mark as False Positive
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
