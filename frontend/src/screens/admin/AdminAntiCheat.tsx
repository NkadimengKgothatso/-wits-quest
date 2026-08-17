import { useState } from 'react';

const FLAGGED_PLAYERS = [
  {
    id: 1, email: 'student_xk9@students.wits.ac.za',
    trustScore: 18, violations: ['Speed Spoofing', 'Rapid Burst Submissions'],
    trajectory: [
      { time: '08:14:22', lat: '-26.1918', lng: '28.0302', vel: 0.4 },
      { time: '08:14:23', lat: '-26.1890', lng: '28.0400', vel: 31.2 },
      { time: '08:14:24', lat: '-26.1955', lng: '28.0215', vel: 45.8 },
      { time: '08:14:25', lat: '-26.1918', lng: '28.0302', vel: 38.1 },
    ],
    matchHistory: [
      { match: 'vs CPU', result: 'Win', date: 'Today 08:14', suspicious: true },
      { match: 'vs Sipho', result: 'Win', date: 'Today 08:10', suspicious: true },
      { match: 'vs Lerato', result: 'Win', date: 'Yesterday', suspicious: false },
    ],
  },
  {
    id: 2, email: 'student_bq2@students.wits.ac.za',
    trustScore: 42, violations: ['Win-Trading'],
    trajectory: [
      { time: '10:02:11', lat: '-26.1925', lng: '28.0310', vel: 0.2 },
      { time: '10:02:45', lat: '-26.1925', lng: '28.0310', vel: 0.1 },
    ],
    matchHistory: [
      { match: 'vs student_xk9', result: 'Loss', date: 'Today 10:02', suspicious: true },
      { match: 'vs student_xk9', result: 'Loss', date: 'Yesterday', suspicious: true },
    ],
  },
];

type Action = '' | 'warn' | 'verify' | 'suspend' | 'override';

export default function AdminAntiCheat() {
  const [selected, setSelected] = useState(FLAGGED_PLAYERS[0]);
  const [overrideScore, setOverrideScore] = useState(String(selected.trustScore));
  const [action, setAction] = useState<Action>('');
  const [actionDone, setActionDone] = useState(false);

  function handleAction(a: Action) {
    setAction(a);
    setActionDone(true);
    setTimeout(() => setActionDone(false), 2000);
  }

  const trustColor = selected.trustScore < 30 ? '#dca668' : selected.trustScore < 60 ? '#e8c99a' : '#dca668';

  return (
    <div style={{ display: 'flex', height: '100%', gap: 0, minHeight: 'calc(100vh - 120px)' }}>
      {/* Left: Flagged list */}
      <div style={{
        width: 320,
        background: 'var(--color-card-bg)',
        borderRight: '1px solid var(--color-border)',
        padding: 20,
        overflowY: 'auto',
      }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--color-text)', marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Flagged Student Accounts ({FLAGGED_PLAYERS.length})
        </div>

        {FLAGGED_PLAYERS.map((p) => {
          const tc = p.trustScore < 30 ? '#EF4444' : p.trustScore < 60 ? '#F59E0B' : 'var(--color-success)';
          return (
            <button
              key={p.id}
              onClick={() => { setSelected(p); setOverrideScore(String(p.trustScore)); }}
              style={{
                width: '100%', background: 'none', border: 'none', padding: 0,
                cursor: 'pointer', textAlign: 'left', marginBottom: 12,
              }}
            >
              <div style={{
                background: selected.id === p.id ? 'var(--color-accent)' : 'var(--color-bg)',
                border: `2px solid ${selected.id === p.id ? 'var(--color-accent)' : 'var(--color-border)'}`,
                borderRadius: 12, padding: 12, transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: 13, fontWeight: 800, color: selected.id === p.id ? 'white' : 'var(--color-text)', marginBottom: 8, wordBreak: 'break-all' }}>
                  {p.email}
                </div>
                {/* Trust score bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                  <div style={{ flex: 1, height: 6, background: selected.id === p.id ? 'rgba(255,255,255,0.3)' : 'var(--color-border)', borderRadius: 99, overflow: 'hidden' }}>
                    <div style={{ width: `${p.trustScore}%`, height: '100%', background: selected.id === p.id ? 'white' : tc, borderRadius: 99 }} />
                  </div>
                  <span style={{ fontSize: 12, fontWeight: 800, color: selected.id === p.id ? 'white' : tc }}>{p.trustScore}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                  {p.violations.map((v) => (
                    <span key={v} style={{
                      fontSize: 10, fontWeight: 800, color: selected.id === p.id ? 'var(--color-accent)' : 'var(--color-muted)',
                      background: selected.id === p.id ? 'white' : 'var(--color-bg)', borderRadius: 6, padding: '4px 8px',
                      border: `1px solid ${selected.id === p.id ? 'transparent' : 'var(--color-border)'}`
                    }}>
                      {v}
                    </span>
                  ))}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Right: Audit Evidence Detail View */}
      <div style={{ flex: 1, padding: 32, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24 }}>
          <div>
            <h3 style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-text)', margin: '0 0 8px' }}>{selected.email}</h3>
            <div style={{ fontSize: 14, color: 'var(--color-muted)', fontWeight: 600 }}>Audit Evidence & Velocity Logs</div>
          </div>
          <div style={{
            background: 'var(--color-card-bg)', border: `2px solid ${trustColor}`,
            borderRadius: 16, padding: '12px 24px', textAlign: 'center', boxShadow: '0 4px 12px rgba(44, 34, 30, 0.05)'
          }}>
            <div style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 800, letterSpacing: '0.05em' }}>TRUST SCORE</div>
            <div style={{ fontSize: 24, fontWeight: 900, color: trustColor }}>{selected.trustScore} / 100</div>
          </div>
        </div>

        {/* Trajectory logs */}
        <div style={{ background: 'var(--color-card-bg)', borderRadius: 16, padding: 24, marginBottom: 24, border: '2px solid var(--color-border)', boxShadow: '0 4px 16px rgba(44, 34, 30, 0.05)' }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--color-text)', marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            GPS Movement Trajectory Log
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {selected.trajectory.map((t, idx) => (
              <div key={idx} style={{
                display: 'flex', justifyContent: 'space-between', fontSize: 13,
                padding: '12px 16px', borderRadius: 12,
                background: t.vel > 5 ? 'rgba(239, 68, 68, 0.1)' : 'var(--color-bg)',
                border: `1.5px solid ${t.vel > 5 ? 'rgba(239, 68, 68, 0.3)' : 'var(--color-border)'}`,
              }}>
                <span style={{ color: 'var(--color-muted)', fontWeight: 700 }}>{t.time}</span>
                <span style={{ color: 'var(--color-text)', fontWeight: 600 }}>{t.lat}, {t.lng}</span>
                <span style={{ fontWeight: 800, color: t.vel > 5 ? '#EF4444' : 'var(--color-text)' }}>
                  {t.vel} m/s {t.vel > 5 && '(SPOOF DETECTED)'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Moderation Action Bar */}
        <div style={{ background: 'var(--color-card-bg)', borderRadius: 16, padding: 24, border: '2px solid var(--color-border)', boxShadow: '0 4px 16px rgba(44, 34, 30, 0.05)' }}>
          <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--color-text)', marginBottom: 16, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Lecturer Moderation Actions
          </div>
          {actionDone && (
            <div style={{ fontSize: 13, color: 'var(--color-success)', marginBottom: 16, fontWeight: 800 }}>
              Action Applied Successfully!
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <button style={{ fontSize: 14, padding: '12px 20px', borderRadius: 10, background: 'transparent', border: '2px solid var(--color-border)', color: 'var(--color-text)', fontWeight: 700, cursor: 'pointer' }} onClick={() => handleAction('warn')}>
              Issue Warning
            </button>
            <button style={{ fontSize: 14, padding: '12px 20px', borderRadius: 10, background: 'transparent', border: '2px solid var(--color-border)', color: 'var(--color-text)', fontWeight: 700, cursor: 'pointer' }} onClick={() => handleAction('verify')}>
              Require Secondary GPS Fix
            </button>
            <button style={{ fontSize: 14, padding: '12px 20px', borderRadius: 10, background: '#EF4444', border: 'none', color: 'white', fontWeight: 800, cursor: 'pointer' }} onClick={() => handleAction('suspend')}>
              Suspend Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
