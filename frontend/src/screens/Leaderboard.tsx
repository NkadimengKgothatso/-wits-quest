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
  Diamond: '#b0cbe6',
  Platinum: '#a4b5d1',
  Gold: '#fed6ce',
  Silver: '#9ca3af',
  Bronze: '#496894',
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
          {top3[1] && (
            <div
              style={{ flex: 1, cursor: 'pointer' }}
              onClick={() => setSelectedPlayer(top3[1])}
            >
              <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#496894', border: '2px solid #a4b5d1', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', color: '#a4b5d1', fontWeight: 800, fontSize: 12 }}>
                  {top3[1].name.substring(0, 2).toUpperCase()}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: top3[1].isCurrentUser ? '#fed6ce' : 'white' }}>
                  {top3[1].name} {top3[1].isCurrentUser && '(You)'}
                </div>
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
          )}

          {/* 1st place */}
          {top3[0] && (
            <div
              style={{ flex: 1.1, cursor: 'pointer' }}
              onClick={() => setSelectedPlayer(top3[0])}
            >
              <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg, #fed6ce, #f5b8ac)', border: '2px solid #fed6ce', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', color: '#1d3156', fontWeight: 900, fontSize: 14, boxShadow: '0 0 16px rgba(254, 214, 206, 0.5)' }}>
                  {top3[0].name.substring(0, 2).toUpperCase()}
                </div>
                <div style={{ fontSize: 12, fontWeight: 800, color: '#fed6ce' }}>
                  {top3[0].name} {top3[0].isCurrentUser && '(You)'}
                </div>
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
          )}

          {/* 3rd place */}
          {top3[2] && (
            <div
              style={{ flex: 1, cursor: 'pointer' }}
              onClick={() => setSelectedPlayer(top3[2])}
            >
              <div style={{ textAlign: 'center', marginBottom: 6 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#496894', border: '2px solid #b0cbe6', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 4px', color: '#b0cbe6', fontWeight: 800, fontSize: 12 }}>
                  {top3[2].name.substring(0, 2).toUpperCase()}
                </div>
                <div style={{ fontSize: 11, fontWeight: 700, color: top3[2].isCurrentUser ? '#fed6ce' : 'white' }}>
                  {top3[2].name} {top3[2].isCurrentUser && '(You)'}
                </div>
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
          )}
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
                  key={p.id || p.rank}
                  onClick={() => setSelectedPlayer(p)}
                  style={{
                    padding: '10px 14px',
                    display: 'flex', alignItems: 'center',
                    borderBottom: '1px solid rgba(164,181,209,0.08)',
                    background: p.isCurrentUser ? 'rgba(254, 214, 206, 0.15)' : 'transparent',
                    cursor: 'pointer',
                    transition: 'background 0.2s',
                  }}
                >
                  <span style={{ width: 32, fontSize: 12, fontWeight: 800, color: p.isCurrentUser ? '#fed6ce' : '#a4b5d1' }}>
                    {p.rank}
                  </span>
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{
                      width: 26, height: 26, borderRadius: '50%', background: p.isCurrentUser ? '#fed6ce' : '#496894',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 10, fontWeight: 800, color: p.isCurrentUser ? '#1d3156' : 'white', flexShrink: 0
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
                  <div style={{ fontSize: 16, fontWeight: 800, color: 'white' }}>
                    {selectedPlayer.name} {selectedPlayer.isCurrentUser && '(You)'}
                  </div>
                  <div style={{ fontSize: 11, color: '#a4b5d1' }}>Rank #{selectedPlayer.rank} · Lv.{selectedPlayer.level}</div>
                </div>
              </div>
              <button onClick={() => setSelectedPlayer(null)} style={{ background: 'none', border: 'none', color: '#a4b5d1', fontSize: 18, cursor: 'pointer' }}>✕</button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginBottom: 16, textAlign: 'center' }}>
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
