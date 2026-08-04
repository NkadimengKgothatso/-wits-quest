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
  Diamond: '#b0cbe6',
  Platinum: '#a4b5d1',
  Gold: '#fed6ce',
  Silver: '#9ca3af',
  Bronze: '#496894',
};

export default function Leaderboard() {
  const [selectedPlayer, setSelectedPlayer] = useState<typeof PLAYERS[0] | null>(null);
  const top3 = PLAYERS.slice(0, 3);
  const rest = PLAYERS.slice(3);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, #253d6a 0%, #1d3156 50%, #0f1a2e 100%)',
      paddingTop: 16,
      paddingBottom: 80,
    }}>
      {/* Title */}
      <div style={{ padding: '14px 16px 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: 22, fontWeight: 900, color: 'white', margin: 0 }}>Campus Leaderboard</h2>
        <p style={{ fontSize: 12, color: '#a4b5d1', margin: '4px 0 16px' }}>Wits Quest Season 1 Rankings</p>
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
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#496894', border: '2px solid #a4b5d1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', color: '#a4b5d1', fontWeight: 800, fontSize: 12 }}>
                LD
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{top3[1].name}</div>
              <div style={{ fontSize: 10, color: '#a4b5d1' }}>Lv.{top3[1].level}</div>
            </div>
            <div style={{
              background: 'linear-gradient(180deg, rgba(164,181,209,0.3) 0%, rgba(73,104,148,0.4) 100%)',
              border: '1px solid rgba(164,181,209,0.5)',
              borderRadius: '10px 10px 0 0',
              height: 80,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 20, fontWeight: 900, color: '#a4b5d1' }}>2</span>
            </div>
          </div>

          {/* 1st place */}
          <div
            style={{ flex: 1.1, cursor: 'pointer' }}
            onClick={() => setSelectedPlayer(top3[0])}
          >
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #fed6ce, #f5b8ac)', border: '2px solid #fed6ce', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', color: '#1d3156', fontWeight: 900, fontSize: 14, boxShadow: '0 0 16px rgba(254, 214, 206, 0.5)' }}>
                TN
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: '#fed6ce' }}>{top3[0].name}</div>
              <div style={{ fontSize: 10, color: '#b0cbe6' }}>Lv.{top3[0].level}</div>
            </div>
            <div style={{
              background: 'linear-gradient(180deg, rgba(254,214,206,0.3) 0%, rgba(73,104,148,0.5) 100%)',
              border: '1px solid rgba(254,214,206,0.6)',
              borderRadius: '10px 10px 0 0',
              height: 105,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#fed6ce' }}>1</span>
            </div>
          </div>

          {/* 3rd place */}
          <div
            style={{ flex: 1, cursor: 'pointer' }}
            onClick={() => setSelectedPlayer(top3[2])}
          >
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#496894', border: '2px solid #b0cbe6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', color: '#b0cbe6', fontWeight: 800, fontSize: 12 }}>
                SM
              </div>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'white' }}>{top3[2].name}</div>
              <div style={{ fontSize: 10, color: '#a4b5d1' }}>Lv.{top3[2].level}</div>
            </div>
            <div style={{
              background: 'linear-gradient(180deg, rgba(176,203,230,0.2) 0%, rgba(73,104,148,0.4) 100%)',
              border: '1px solid rgba(176,203,230,0.4)',
              borderRadius: '10px 10px 0 0',
              height: 65,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 18, fontWeight: 900, color: '#b0cbe6' }}>3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto' }}>
        <div className="glass-dark" style={{ borderRadius: 16, overflow: 'hidden' }}>
          <div style={{
            padding: '10px 14px', background: 'rgba(29,49,86,0.6)',
            borderBottom: '1px solid rgba(164,181,209,0.15)',
            display: 'flex', fontSize: 10, fontWeight: 700, color: '#a4b5d1',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 32 }}>#</span>
            <span style={{ flex: 1 }}>Student Player</span>
            <span style={{ width: 70, textAlign: 'right' }}>Division</span>
            <span style={{ width: 70, textAlign: 'right' }}>XP</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {rest.map((p) => {
              const divColor = DIVISION_COLOR[p.division] ?? '#a4b5d1';
              return (
                <div
                  key={p.rank}
                  onClick={() => setSelectedPlayer(p)}
                  style={{
                    padding: '10px 14px',
                    display: 'flex', alignItems: 'center',
                    borderBottom: '1px solid rgba(164,181,209,0.08)',
                    background: p.isCurrentUser ? 'rgba(254, 214, 206, 0.12)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{ width: 32, fontSize: 12, fontWeight: 800, color: p.isCurrentUser ? '#fed6ce' : '#a4b5d1' }}>
                    {p.rank}
                  </span>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', background: '#496894',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 800, color: 'white', flexShrink: 0
                    }}>
                      {p.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 700, color: p.isCurrentUser ? '#fed6ce' : 'white' }}>
                        {p.name} {p.isCurrentUser && '(You)'}
                      </div>
                      <div style={{ fontSize: 10, color: '#a4b5d1' }}>Lv.{p.level} · {p.wins} Wins</div>
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
            position: 'fixed', inset: 0, background: 'rgba(13,22,45,0.8)',
            backdropFilter: 'blur(12px)', zIndex: 100,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
          onClick={(e) => e.target === e.currentTarget && setSelectedPlayer(null)}
        >
          <div className="glass-modal slide-up" style={{ width: '100%', maxWidth: 440, padding: 24, borderRadius: '20px 20px 0 0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#496894', border: '2px solid #fed6ce', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fed6ce', fontWeight: 800, fontSize: 16 }}>
                  {selectedPlayer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>{selectedPlayer.name}</div>
                  <div style={{ fontSize: 11, color: '#a4b5d1' }}>Rank #{selectedPlayer.rank} · Lv.{selectedPlayer.level}</div>
                </div>
              </div>
              <button onClick={() => setSelectedPlayer(null)} style={{ background: 'none', border: 'none', color: '#a4b5d1', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16, textCenter: 'center' }}>
              <div className="glass-dark" style={{ padding: 10, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#a4b5d1' }}>TOTAL XP</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fed6ce' }}>{selectedPlayer.xp.toLocaleString()}</div>
              </div>
              <div className="glass-dark" style={{ padding: 10, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#a4b5d1' }}>PVP WINS</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#b0cbe6' }}>{selectedPlayer.wins}</div>
              </div>
              <div className="glass-dark" style={{ padding: 10, borderRadius: 10, textAlign: 'center' }}>
                <div style={{ fontSize: 9, color: '#a4b5d1' }}>STREAK</div>
                <div style={{ fontSize: 14, fontWeight: 800, color: '#fed6ce' }}>{selectedPlayer.streak} Days</div>
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
