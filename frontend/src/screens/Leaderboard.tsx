import { useState } from 'react';

const PLAYERS = [
  { rank: 1, name: 'Thabo Nkosi', level: 28, xp: 48200, wins: 142, division: 'Diamond', streak: 12 },
  { rank: 2, name: 'Lerato Dlamini', level: 25, xp: 41550, wins: 118, division: 'Diamond', streak: 7 },
  { rank: 3, name: 'Sipho Mokoena', level: 24, xp: 38900, wins: 109, division: 'Platinum', streak: 5 },
  { rank: 4, name: 'Amahle Zulu', level: 22, xp: 34200, wins: 97, division: 'Platinum', streak: 9 },
  { rank: 5, name: 'Kagiso Mthembu', level: 12, xp: 2450, wins: 34, division: 'Gold', streak: 7, isCurrentUser: true },
  { rank: 6, name: 'Nandi Khumalo', level: 11, xp: 19800, wins: 62, division: 'Gold', streak: 3 },
  { rank: 7, name: 'Bongani Sithole', level: 10, xp: 17400, wins: 55, division: 'Silver', streak: 1 },
  { rank: 8, name: 'Zanele Hadebe', level: 9, xp: 15100, wins: 48, division: 'Silver', streak: 4 },
  { rank: 9, name: 'Lwazi Mthethwa', level: 8, xp: 12600, wins: 39, division: 'Bronze', streak: 2 },
  { rank: 10, name: 'Palesa Motha', level: 7, xp: 10800, wins: 32, division: 'Bronze', streak: 6 },
];

const DIVISION_COLOR: Record<string, string> = {
  Diamond: '#e8c99a',
  Platinum: '#dca668',
  Gold: '#dca668',
  Silver: '#9ca3af',
  Bronze: '#6b7d2c',
};

export default function Leaderboard() {
  const [selectedPlayer, setSelectedPlayer] = useState<typeof PLAYERS[0] | null>(null);
  const top3 = PLAYERS.slice(0, 3);
  const rest = PLAYERS.slice(3);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #6b5630 0%, #54441b 50%, #3d2f12 100%)',
      paddingTop: 16,
      paddingBottom: 80,
    }}>
      {/* Title */}
      <div style={{ padding: '14px 16px 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', margin: 0 }}>Campus Leaderboard</h2>
        <p style={{ fontSize: 12, color: '#dca668', margin: '4px 0 16px' }}>Wits Quest Season 1 Rankings</p>
      </div>

      {/* Top 3 Podium */}
      <div style={{ padding: '0 16px 20px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'center', gap: 10 }}>
          {/* 2nd place */}
          <div
            style={{ flex: 1, cursor: 'pointer' }}
            onClick={() => setSelectedPlayer(top3[1])}
          >
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#6b7d2c', border: '2px solid #dca668', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', color: '#dca668', fontWeight: 800, fontSize: 12 }}>
                LD
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{top3[1].name}</div>
              <div style={{ fontSize: 10, color: '#dca668' }}>Lv.{top3[1].level}</div>
            </div>
            <div style={{
              background: 'linear-gradient(180deg, rgba(220, 166, 104, 0.3) 0%, rgba(107, 125, 44, 0.4) 100%)',
              border: '1px solid rgba(220, 166, 104, 0.5)',
              borderRadius: '10px 10px 0 0',
              height: 80,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#dca668' }}>2</span>
            </div>
          </div>

          {/* 1st place */}
          <div
            style={{ flex: 1.1, cursor: 'pointer' }}
            onClick={() => setSelectedPlayer(top3[0])}
          >
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #dca668, #e8c99a)', border: '2px solid #dca668', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', color: '#54441b', fontWeight: 900, fontSize: 14, boxShadow: '0 0 16px rgba(220, 166, 104, 0.5)' }}>
                TN
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#dca668' }}>{top3[0].name}</div>
              <div style={{ fontSize: 10, color: '#e8c99a' }}>Lv.{top3[0].level}</div>
            </div>
            <div style={{
              background: 'linear-gradient(180deg, rgba(220, 166, 104, 0.3) 0%, rgba(107, 125, 44, 0.5) 100%)',
              border: '1px solid rgba(220, 166, 104, 0.6)',
              borderRadius: '10px 10px 0 0',
              height: 105,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#dca668' }}>1</span>
            </div>
          </div>

          {/* 3rd place */}
          <div
            style={{ flex: 1, cursor: 'pointer' }}
            onClick={() => setSelectedPlayer(top3[2])}
          >
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#6b7d2c', border: '2px solid #e8c99a', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', color: '#e8c99a', fontWeight: 800, fontSize: 12 }}>
                SM
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{top3[2].name}</div>
              <div style={{ fontSize: 10, color: '#dca668' }}>Lv.{top3[2].level}</div>
            </div>
            <div style={{
              background: 'linear-gradient(180deg, rgba(232, 201, 154, 0.2) 0%, rgba(107, 125, 44, 0.4) 100%)',
              border: '1px solid rgba(232, 201, 154, 0.4)',
              borderRadius: '10px 10px 0 0',
              height: 65,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#e8c99a' }}>3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto' }}>
        <div className="glass-dark" style={{ borderRadius: 16, overflow: 'hidden' }}>
          <div style={{
            padding: '10px 14px', background: 'rgba(84, 68, 27, 0.7)',
            borderBottom: '1px solid rgba(220, 166, 104, 0.15)',
            display: 'flex', fontSize: 10, fontWeight: 700, color: '#dca668',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 32 }}>#</span>
            <span style={{ flex: 1 }}>Student Player</span>
            <span style={{ width: 70, textAlign: 'right' }}>Division</span>
            <span style={{ width: 70, textAlign: 'right' }}>XP</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {rest.map((p) => {
              const divColor = DIVISION_COLOR[p.division] ?? '#dca668';
              return (
                <div
                  key={p.rank}
                  onClick={() => setSelectedPlayer(p)}
                  style={{
                    padding: '10px 14px',
                    display: 'flex', alignItems: 'center',
                    borderBottom: '1px solid rgba(220, 166, 104, 0.08)',
                    background: p.isCurrentUser ? 'rgba(220, 166, 104, 0.12)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{ width: 32, fontSize: 12, fontWeight: 800, color: p.isCurrentUser ? '#dca668' : '#dca668' }}>
                    {p.rank}
                  </span>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', background: '#6b7d2c',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 800, color: 'white', flexShrink: 0
                    }}>
                      {p.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: p.isCurrentUser ? '#dca668' : 'white' }}>
                        {p.name} {p.isCurrentUser && '(You)'}
                      </div>
                      <div style={{ fontSize: 10, color: '#dca668' }}>Lv.{p.level} · {p.wins} Wins</div>
                    </div>
                  </div>
                  <span style={{
                    width: 70, textAlign: 'right', fontSize: 10, fontWeight: 700, color: divColor,
                  }}>
                    {p.division}
                  </span>
                  <span style={{ width: 70, textAlign: 'right', fontSize: 11, fontWeight: 800, color: 'white' }}>
                    {p.xp.toLocaleString()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Selected player drawer */}
      {selectedPlayer && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(63, 47, 18, 0.88)',
            backdropFilter: 'blur(12px)', zIndex: 100,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
          onClick={(e) => e.target === e.currentTarget && setSelectedPlayer(null)}
        >
          <div className="glass-modal slide-up" style={{ width: '100%', maxWidth: 440, padding: 24, borderRadius: '20px 20px 0 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#6b7d2c', border: '2px solid #dca668', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dca668', fontWeight: 800, fontSize: 16 }}>
                  {selectedPlayer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>{selectedPlayer.name}</div>
                  <div style={{ fontSize: 11, color: '#dca668' }}>Rank #{selectedPlayer.rank} · Lv.{selectedPlayer.level}</div>
                </div>
              </div>
              <button onClick={() => setSelectedPlayer(null)} style={{ background: 'none', border: 'none', color: '#dca668', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16, textAlign: 'center' }}>
              <div className="glass-dark" style={{ padding: 10, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#dca668' }}>TOTAL XP</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#dca668' }}>{selectedPlayer.xp.toLocaleString()}</div>
              </div>
              <div className="glass-dark" style={{ padding: 10, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#dca668' }}>PVP WINS</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#e8c99a' }}>{selectedPlayer.wins}</div>
              </div>
              <div className="glass-dark" style={{ padding: 10, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#dca668' }}>STREAK</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#dca668' }}>{selectedPlayer.streak} Days</div>
              </div>
            </div>

            <button className="btn-peach" style={{ width: '100%', fontSize: 13, padding: '12px' }} onClick={() => setSelectedPlayer(null)}>
              Send Async Challenge
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
