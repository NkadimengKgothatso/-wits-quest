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
        width: 260,
        background: 'rgba(63, 47, 18, 0.95)',
        borderRight: '1px solid rgba(220, 166, 104, 0.15)',
        padding: 14,
        overflowY: 'auto',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'white', marginBottom: 12, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Flagged Student Accounts ({FLAGGED_PLAYERS.length})
        </div>

        {FLAGGED_PLAYERS.map((p) => {
          const tc = p.trustScore < 30 ? '#dca668' : p.trustScore < 60 ? '#e8c99a' : '#dca668';
          return (
            <button
              key={p.id}
              onClick={() => { setSelected(p); setOverrideScore(String(p.trustScore)); }}
              style={{
                width: '100%', background: 'none', border: 'none', padding: 0,
                cursor: 'pointer', textAlign: 'left', marginBottom: 10,
              }}
            >
              <div style={{
                background: selected.id === p.id ? 'rgba(107, 125, 44, 0.5)' : 'rgba(107, 125, 44, 0.25)',
                border: `1px solid ${selected.id === p.id ? '#dca668' : 'rgba(220, 166, 104, 0.15)'}`,
                borderRadius: 10, padding: 10, transition: 'all 0.2s',
              }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'white', marginBottom: 6, wordBreak: 'break-all' }}>
                  {p.email}
                </div>
                {/* Trust score bar */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                  <div className="stat-bar-track" style={{ flex: 1 }}>
                    <div className="stat-bar-fill" style={{ width: `${p.trustScore}%`, background: tc }} />
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 800, color: tc }}>{p.trustScore}</span>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                  {p.violations.map((v) => (
                    <span key={v} style={{
                      fontSize: 8, fontWeight: 700, color: '#dca668',
                      background: 'rgba(220, 166, 104, 0.15)', borderRadius: 4, padding: '2px 5px',
                      border: '1px solid rgba(220, 166, 104, 0.3)'
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
      <div style={{ flex: 1, padding: 16, overflowY: 'auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 800, color: 'white', margin: '0 0 4px' }}>{selected.email}</h3>
            <div style={{ fontSize: 11, color: '#dca668' }}>Audit Evidence & Velocity Logs</div>
          </div>
          <div style={{
            background: 'rgba(84, 68, 27, 0.8)', border: `1.5px solid ${trustColor}`,
            borderRadius: 12, padding: '6px 14px', textAlign: 'center'
          }}>
            <div style={{ fontSize: 9, color: '#dca668', fontWeight: 700, letterSpacing: '0.05em' }}>TRUST SCORE</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: trustColor }}>{selected.trustScore} / 100</div>
          </div>
        </div>

        {/* Trajectory logs */}
        <div className="glass-dark" style={{ borderRadius: 12, padding: 12, marginBottom: 16 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#e8c99a', marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            GPS Movement Trajectory Log
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {selected.trajectory.map((t, idx) => (
              <div key={idx} style={{
                display: 'flex', justifyContent: 'space-between', fontSize: 11,
                padding: '6px 10px', borderRadius: 6,
                background: t.vel > 5 ? 'rgba(220, 166, 104, 0.15)' : 'rgba(107, 125, 44, 0.2)',
                border: `1px solid ${t.vel > 5 ? 'rgba(220, 166, 104, 0.3)' : 'rgba(220, 166, 104, 0.1)'}`,
              }}>
                <span style={{ color: '#dca668' }}>{t.time}</span>
                <span style={{ color: 'white' }}>{t.lat}, {t.lng}</span>
                <span style={{ fontWeight: 700, color: t.vel > 5 ? '#dca668' : '#e8c99a' }}>
                  {t.vel} m/s {t.vel > 5 && '(SPOOF DETECTED)'}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Moderation Action Bar */}
        <div className="glass-dark" style={{ borderRadius: 12, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#dca668', marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Lecturer Moderation Actions
          </div>
          {actionDone && (
            <div style={{ fontSize: 11, color: '#dca668', marginBottom: 10, fontWeight: 700 }}>
              Action Applied Successfully!
            </div>
          )}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <button className="btn-ghost" style={{ fontSize: 11, padding: '8px 14px', borderRadius: 6 }} onClick={() => handleAction('warn')}>
              Issue Warning
            </button>
            <button className="btn-ghost" style={{ fontSize: 11, padding: '8px 14px', borderRadius: 6 }} onClick={() => handleAction('verify')}>
              Require Secondary GPS Fix
            </button>
            <button className="btn-peach" style={{ fontSize: 11, padding: '8px 14px', borderRadius: 6 }} onClick={() => handleAction('suspend')}>
              Suspend Account
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
