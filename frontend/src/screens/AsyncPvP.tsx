import { useState } from 'react';

type Tab = 'yourturn' | 'waiting' | 'pending' | 'history';

const YOUR_TURN_MATCHES = [
  { id: 1, opponent: 'Thabo Nkosi', level: 28, turn: '3/5', expires: '8h 14m', score: '1-1' },
  { id: 2, opponent: 'Lerato Dlamini', level: 25, turn: '1/5', expires: '22h 50m', score: '0-0' },
];
const WAITING_MATCHES = [
  { id: 3, opponent: 'Amahle Zulu', level: 22, turn: '4/5', expires: '5h 30m', score: '2-1' },
  { id: 4, opponent: 'Sipho Mokoena', level: 24, turn: '2/5', expires: '19h 00m', score: '0-1' },
];
const PENDING = [
  { id: 5, challenger: 'Bongani Sithole', level: 10, sent: '2h ago' },
];
const HISTORY = [
  { id: 6, opponent: 'Nandi Khumalo', result: 'Win', score: '3-2', xp: '+420', date: 'Today' },
  { id: 7, opponent: 'Zanele Hadebe', result: 'Loss', score: '1-3', xp: '+120', date: 'Yesterday' },
  { id: 8, opponent: 'Lwazi Mthethwa', result: 'Win', score: '3-0', xp: '+500', date: 'Jul 28' },
];

export default function AsyncPvP() {
  const [tab, setTab] = useState<Tab>('yourturn');
  const [searchQuery, setSearchQuery] = useState('');

  const TABS: { id: Tab; label: string; count?: number }[] = [
    { id: 'yourturn', label: 'Your Turn', count: YOUR_TURN_MATCHES.length },
    { id: 'waiting', label: 'Waiting', count: WAITING_MATCHES.length },
    { id: 'pending', label: 'Challenges', count: PENDING.length },
    { id: 'history', label: 'History' },
  ];

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 40% 10%, #6b5630 0%, #54441b 50%, #3d2f12 100%)',
      paddingTop: 16, paddingBottom: 80,
    }}>
      <div style={{ padding: '14px 16px 0', maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: '0 0 4px' }}>Async PvP Challenges</h2>
        <p style={{ fontSize: 12, color: '#dca668', margin: '0 0 16px' }}>Turn-based challenges against fellow Wits students</p>
      </div>

      {/* Tabs */}
      <div style={{ padding: '0 16px 16px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', gap: 6, background: 'rgba(63, 47, 18, 0.6)', padding: 4, borderRadius: 12 }}>
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              style={{
                flex: 1, padding: '8px 4px', borderRadius: 9, border: 'none', cursor: 'pointer',
                fontSize: 11, fontWeight: 700, transition: 'all 0.2s',
                background: tab === t.id ? 'rgba(254,214,206,0.2)' : 'transparent',
                color: tab === t.id ? '#dca668' : '#dca668',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4,
              }}
            >
              {t.label}
              {t.count !== undefined && t.count > 0 && (
                <span style={{
                  background: '#dca668', color: '#54441b', borderRadius: '50%',
                  width: 16, height: 16, fontSize: 9, fontWeight: 800,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content Area */}
      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
        {tab === 'yourturn' && YOUR_TURN_MATCHES.map((m) => (
          <div key={m.id} className="glass-dark" style={{ padding: 14, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#6b7d2c', border: '2px solid #dca668', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dca668', fontWeight: 800, fontSize: 13 }}>
                {m.opponent.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{m.opponent}</div>
                <div style={{ fontSize: 10, color: '#dca668' }}>Turn {m.turn} · Score {m.score} · {m.expires} left</div>
              </div>
            </div>
            <button className="btn-peach" style={{ fontSize: 11, padding: '8px 14px', borderRadius: 8 }}>
              Play Turn
            </button>
          </div>
        ))}

        {tab === 'waiting' && WAITING_MATCHES.map((m) => (
          <div key={m.id} className="glass-dark" style={{ padding: 14, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 38, height: 38, borderRadius: '50%', background: '#6b7d2c', border: '2px solid #e8c99a', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#e8c99a', fontWeight: 800, fontSize: 13 }}>
                {m.opponent.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{m.opponent}</div>
                <div style={{ fontSize: 10, color: '#dca668' }}>Turn {m.turn} · Score {m.score} · Waiting for move</div>
              </div>
            </div>
            <span style={{ fontSize: 10, color: '#e8c99a', background: 'rgba(232, 201, 154, 0.15)', padding: '4px 10px', borderRadius: 10, fontWeight: 700 }}>
              {m.expires}
            </span>
          </div>
        ))}

        {tab === 'pending' && PENDING.map((m) => (
          <div key={m.id} className="glass-dark" style={{ padding: 14, borderRadius: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 700, color: 'white' }}>{m.challenger}</div>
              <div style={{ fontSize: 10, color: '#dca668' }}>Challenged you {m.sent} · Lv.{m.level}</div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button className="btn-peach" style={{ fontSize: 11, padding: '6px 12px', borderRadius: 6 }}>Accept</button>
              <button className="btn-ghost" style={{ fontSize: 11, padding: '6px 12px', borderRadius: 6 }}>Decline</button>
            </div>
          </div>
        ))}

        {tab === 'history' && HISTORY.map((m) => (
          <div key={m.id} className="glass-dark" style={{ padding: 12, borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{m.opponent}</div>
              <div style={{ fontSize: 10, color: '#dca668' }}>{m.date} · Score {m.score}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: m.result === 'Win' ? '#dca668' : '#dca668' }}>{m.result}</div>
              <div style={{ fontSize: 10, color: '#e8c99a' }}>{m.xp} XP</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
