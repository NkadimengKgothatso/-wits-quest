import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DEFAULT_PLAYERS = [
  { id: 'usr_thabo', name: 'Thabo Nkosi', level: 28, xp: 48200, wins: 142, division: 'Diamond', streak: 12 },
  { id: 'usr_lerato', name: 'Lerato Dlamini', level: 25, xp: 41550, wins: 118, division: 'Diamond', streak: 7 },
  { id: 'usr_sipho', name: 'Sipho Mokoena', level: 24, xp: 38900, wins: 109, division: 'Platinum', streak: 5 },
  { id: 'usr_amahle', name: 'Amahle Zulu', level: 22, xp: 34200, wins: 97, division: 'Platinum', streak: 9 },
  { id: 'usr_kagiso', name: 'Kagiso Mthembu', level: 12, xp: 2450, wins: 34, division: 'Gold', streak: 7 },
  { id: 'usr_nandi', name: 'Nandi Khumalo', level: 11, xp: 19800, wins: 62, division: 'Gold', streak: 3 },
  { id: 'usr_bongani', name: 'Bongani Sithole', level: 10, xp: 17400, wins: 55, division: 'Silver', streak: 1 },
  { id: 'usr_zanele', name: 'Zanele Hadebe', level: 9, xp: 15100, wins: 48, division: 'Silver', streak: 4 },
  { id: 'usr_lwazi', name: 'Lwazi Mthethwa', level: 8, xp: 12600, wins: 39, division: 'Bronze', streak: 2 },
  { id: 'usr_palesa', name: 'Palesa Motha', level: 7, xp: 10800, wins: 32, division: 'Bronze', streak: 6 },
];

const DIVISION_COLOR: Record<string, string> = {
  Diamond: '#e8c99a',
  Platinum: '#dca668',
  Gold: '#dca668',
  Silver: '#9ca3af',
  Bronze: '#6b7d2c',
};

export default function Leaderboard() {
  const { currentUser } = useAuth();
  const [selectedPlayer, setSelectedPlayer] = useState<any | null>(null);

  // Construct active players list with live logged in user stats
  let playersList = DEFAULT_PLAYERS.map((p) => {
    if (
      currentUser &&
      (p.id === currentUser.id ||
        p.name.toLowerCase() === (currentUser.name || '').toLowerCase() ||
        p.name.toLowerCase().includes((currentUser.username || '').toLowerCase()))
    ) {
      return {
        ...p,
        name: currentUser.name || currentUser.username,
        level: currentUser.level,
        xp: currentUser.totalXP || currentUser.currentXP || p.xp,
        wins: currentUser.pvpWins || p.wins,
        division: currentUser.divisionTier || p.division,
        streak: currentUser.dailyStreakCount || p.streak,
        isCurrentUser: true,
      };
    }
    return { ...p, isCurrentUser: false };
  });

  // If active user is not in standard list, insert them according to their total XP
  const hasCurrentUserInList = playersList.some((p) => p.isCurrentUser);
  if (currentUser && !hasCurrentUserInList) {
    playersList.push({
      id: currentUser.id,
      name: currentUser.name || currentUser.username,
      level: currentUser.level,
      xp: currentUser.totalXP || currentUser.currentXP || 0,
      wins: currentUser.pvpWins || 0,
      division: currentUser.divisionTier || 'GOLD',
      streak: currentUser.dailyStreakCount || 1,
      isCurrentUser: true,
    });
  }

  // Sort players by total XP descending and compute rank
  playersList.sort((a, b) => b.xp - a.xp);
  const rankedPlayers = playersList.map((p, idx) => ({ ...p, rank: idx + 1 }));

  const top3 = rankedPlayers.slice(0, 3);
  const rest = rankedPlayers.slice(3);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 0%, var(--color-bg) 0%, #E5D5C5 100%)',
      paddingTop: 16,
      paddingBottom: 80,
    }}>
      {/* Title */}
      <div style={{ padding: '14px 16px 0', textAlign: 'center' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-text)', margin: 0 }}>Campus Leaderboard</h2>
        <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: '4px 0 16px', fontWeight: 600 }}>Wits Quest Season 1 Rankings</p>
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
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-card-bg)', border: '2px solid var(--color-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', color: 'var(--color-muted)', fontWeight: 800, fontSize: 14 }}>
                LD
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-text)' }}>{top3[1].name}</div>
              <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>Lv.{top3[1].level}</div>
            </div>
            <div style={{
              background: 'linear-gradient(180deg, rgba(138, 123, 114, 0.1) 0%, rgba(138, 123, 114, 0.3) 100%)',
              border: '1px solid rgba(138, 123, 114, 0.2)',
              borderRadius: '16px 16px 0 0',
              height: 80,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-muted)' }}>2</span>
            </div>
          </div>

          {/* 1st place */}
          <div
            style={{ flex: 1.1, cursor: 'pointer' }}
            onClick={() => setSelectedPlayer(top3[0])}
          >
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <div style={{ width: 48, height: 48, borderRadius: '50%', background: 'var(--color-accent)', border: '2px solid white', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', color: 'white', fontWeight: 900, fontSize: 16, boxShadow: '0 4px 16px rgba(211, 122, 50, 0.4)' }}>
                TN
              </div>
              <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--color-accent)' }}>{top3[0].name}</div>
              <div style={{ fontSize: 11, color: 'var(--color-text)', fontWeight: 600 }}>Lv.{top3[0].level}</div>
            </div>
            <div style={{
              background: 'linear-gradient(180deg, rgba(211, 122, 50, 0.1) 0%, rgba(211, 122, 50, 0.25) 100%)',
              border: '1px solid rgba(211, 122, 50, 0.3)',
              borderRadius: '16px 16px 0 0',
              height: 105,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 28, fontWeight: 900, color: 'var(--color-accent)' }}>1</span>
            </div>
          </div>

          {/* 3rd place */}
          <div
            style={{ flex: 1, cursor: 'pointer' }}
            onClick={() => setSelectedPlayer(top3[2])}
          >
            <div style={{ textAlign: 'center', marginBottom: 6 }}>
              <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--color-card-bg)', border: '2px solid #8B5CF6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', color: '#8B5CF6', fontWeight: 800, fontSize: 14 }}>
                SM
              </div>
              <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-text)' }}>{top3[2].name}</div>
              <div style={{ fontSize: 11, color: 'var(--color-muted)' }}>Lv.{top3[2].level}</div>
            </div>
            <div style={{
              background: 'linear-gradient(180deg, rgba(139, 92, 246, 0.05) 0%, rgba(139, 92, 246, 0.15) 100%)',
              border: '1px solid rgba(139, 92, 246, 0.2)',
              borderRadius: '16px 16px 0 0',
              height: 65,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <span style={{ fontSize: 24, fontWeight: 900, color: '#8B5CF6' }}>3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Rankings Table */}
      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ background: 'var(--color-card-bg)', borderRadius: 16, overflow: 'hidden', border: '1px solid var(--color-border)', boxShadow: '0 4px 16px rgba(44, 34, 30, 0.05)' }}>
          <div style={{
            padding: '12px 16px', background: 'var(--color-bg)',
            borderBottom: '1px solid var(--color-border)',
            display: 'flex', fontSize: 11, fontWeight: 800, color: 'var(--color-muted)',
            letterSpacing: '0.06em', textTransform: 'uppercase',
          }}>
            <span style={{ width: 32 }}>#</span>
            <span style={{ flex: 1 }}>Student Player</span>
            <span style={{ width: 70, textAlign: 'right' }}>Division</span>
            <span style={{ width: 70, textAlign: 'right' }}>XP</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {rest.map((p) => {
              const divColor = DIVISION_COLOR[p.division] ?? 'var(--color-text)';
              return (
                <div
                  key={p.id || p.rank}
                  onClick={() => setSelectedPlayer(p)}
                  style={{
                    padding: '12px 16px',
                    display: 'flex', alignItems: 'center',
                    borderBottom: '1px solid var(--color-border)',
                    background: p.isCurrentUser ? 'rgba(211, 122, 50, 0.08)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{ width: 32, fontSize: 13, fontWeight: 800, color: p.isCurrentUser ? 'var(--color-accent)' : 'var(--color-muted)' }}>
                    {p.rank}
                  </span>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: '50%', background: p.isCurrentUser ? 'var(--color-accent)' : 'var(--color-bg)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 11, fontWeight: 800, color: p.isCurrentUser ? 'white' : 'var(--color-text)', flexShrink: 0,
                      border: p.isCurrentUser ? 'none' : '1px solid var(--color-border)'
                    }}>
                      {p.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 800, color: p.isCurrentUser ? 'var(--color-accent)' : 'var(--color-text)' }}>
                        {p.name} {p.isCurrentUser && '(You)'}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 600 }}>Lv.{p.level} · {p.wins} Wins</div>
                    </div>
                  </div>
                  <span style={{
                    width: 70, textAlign: 'right', fontSize: 11, fontWeight: 800, color: divColor,
                  }}>
                    {p.division}
                  </span>
                  <span style={{ width: 70, textAlign: 'right', fontSize: 12, fontWeight: 900, color: 'var(--color-text)' }}>
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
            position: 'fixed', inset: 0, background: 'rgba(44, 34, 30, 0.6)',
            backdropFilter: 'blur(8px)', zIndex: 100,
            display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
          }}
          onClick={(e) => e.target === e.currentTarget && setSelectedPlayer(null)}
        >
          <div style={{ background: 'var(--color-card-bg)', width: '100%', maxWidth: 440, padding: 24, borderRadius: '24px 24px 0 0', boxShadow: '0 -8px 32px rgba(44, 34, 30, 0.1)', animation: 'slide-up 0.3s ease-out' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'var(--color-bg)', border: '2px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--color-text)', fontWeight: 900, fontSize: 20 }}>
                  {selectedPlayer.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 18, fontWeight: 900, color: 'var(--color-text)' }}>{selectedPlayer.name}</div>
                  <div style={{ fontSize: 13, color: 'var(--color-muted)', fontWeight: 700 }}>Rank #{selectedPlayer.rank} · Lv.{selectedPlayer.level}</div>
                </div>
              </div>
              <button onClick={() => setSelectedPlayer(null)} style={{ background: 'var(--color-bg)', border: 'none', color: 'var(--color-text)', width: 32, height: 32, borderRadius: '50%', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 20, textAlign: 'center' }}>
              <div style={{ padding: 12, borderRadius: 12, background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 10, color: 'var(--color-muted)', fontWeight: 800, letterSpacing: '0.05em' }}>TOTAL XP</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-text)' }}>{selectedPlayer.xp.toLocaleString()}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 12, background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 10, color: 'var(--color-muted)', fontWeight: 800, letterSpacing: '0.05em' }}>PVP WINS</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-text)' }}>{selectedPlayer.wins}</div>
              </div>
              <div style={{ padding: 12, borderRadius: 12, background: 'var(--color-bg)', border: '1px solid var(--color-border)' }}>
                <div style={{ fontSize: 10, color: 'var(--color-muted)', fontWeight: 800, letterSpacing: '0.05em' }}>STREAK</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: 'var(--color-text)' }}>{selectedPlayer.streak} Days</div>
              </div>
            </div>

            <button style={{ width: '100%', fontSize: 15, padding: '14px', background: 'var(--color-accent)', color: 'white', fontWeight: 800, border: 'none', borderRadius: 14, cursor: 'pointer', boxShadow: '0 4px 12px rgba(211, 122, 50, 0.3)' }} onClick={() => setSelectedPlayer(null)}>
              Send Async Challenge
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
