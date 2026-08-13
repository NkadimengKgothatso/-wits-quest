import { useState } from 'react';

const SEASONS = [
  { rank: 1, name: 'Thabo Nkosi', elo: 1940, tier: 'Grandmaster' },
  { rank: 2, name: 'Lerato Dlamini', elo: 1850, tier: 'Master' },
  { rank: 3, name: 'Sipho Mokoena', elo: 1780, tier: 'Diamond' },
  { rank: 4, name: 'Kagiso Mthembu (You)', elo: 1540, tier: 'Diamond', isUser: true },
];

export default function RankedMatchmaking() {
  const [inQueue, setInQueue] = useState(false);
  const [queueTime, setQueueTime] = useState(0);

  function handleStartQueue() {
    setInQueue(true);
    setQueueTime(0);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 20%, #6b5630 0%, #54441b 50%, #3d2f12 100%)',
      paddingTop: 16, paddingBottom: 80,
    }}>
      <div style={{ padding: '14px 16px', maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: '0 0 4px' }}>Ranked Elo Seasons</h2>
        <p style={{ fontSize: 12, color: '#dca668', margin: 0 }}>Competitive seasonal ladder & Elo rating matchmaking</p>
      </div>

      {/* User Rank Card */}
      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto', marginBottom: 16 }}>
        <div className="glass-dark" style={{ borderRadius: 16, padding: 18, border: '1.5px solid #dca668', textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: '#dca668', fontWeight: 700, letterSpacing: '0.1em' }}>YOUR CURRENT RATING</div>
          <div style={{ fontSize: 32, fontWeight: 900, color: '#dca668', margin: '4px 0' }}>1,540 Elo</div>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#e8c99a' }}>Diamond Tier · Rank #4 Campuswide</div>
          <div style={{ fontSize: 10, color: '#dca668', marginTop: 8 }}>Season 1 ends in 12 days</div>
        </div>
      </div>

      {/* Queue Action Button */}
      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto', marginBottom: 20 }}>
        {inQueue ? (
          <div className="glass-dark" style={{ borderRadius: 14, padding: 16, textAlign: 'center', border: '1px solid #e8c99a' }}>
            <div style={{ fontSize: 13, fontWeight: 800, color: '#e8c99a', marginBottom: 6 }}>Searching for Opponent...</div>
            <div style={{ fontSize: 11, color: '#dca668' }}>Matching within ±50 Elo range</div>
            <button className="btn-ghost" style={{ fontSize: 11, padding: '8px 16px', borderRadius: 8, marginTop: 12 }} onClick={() => setInQueue(false)}>
              Cancel Queue
            </button>
          </div>
        ) : (
          <button className="btn-peach" style={{ width: '100%', fontSize: 14, padding: '14px', borderRadius: 12 }} onClick={handleStartQueue}>
            Find Ranked Match
          </button>
        )}
      </div>

      {/* Leaderboard preview */}
      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto' }}>
        <div className="glass-dark" style={{ borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#e8c99a', marginBottom: 10, textTransform: 'uppercase' }}>
            Top Season 1 Ranked Competitors
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {SEASONS.map((s) => (
              <div key={s.rank} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '8px 12px', borderRadius: 8,
                background: s.isUser ? 'rgba(220, 166, 104, 0.15)' : 'rgba(107, 125, 44, 0.25)',
                border: `1px solid ${s.isUser ? '#dca668' : 'rgba(220, 166, 104, 0.15)'}`,
              }}>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: s.isUser ? '#dca668' : 'white' }}>
                    #{s.rank} {s.name}
                  </div>
                  <div style={{ fontSize: 10, color: '#dca668' }}>{s.tier}</div>
                </div>
                <div style={{ fontSize: 13, fontWeight: 900, color: s.isUser ? '#dca668' : 'white' }}>
                  {s.elo} Elo
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
