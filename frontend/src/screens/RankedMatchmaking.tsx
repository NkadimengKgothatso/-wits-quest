import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DEFAULT_SEASONS = [
  { id: 'usr_thabo', name: 'Thabo Nkosi', elo: 1940, tier: 'Grandmaster' },
  { id: 'usr_lerato', name: 'Lerato Dlamini', elo: 1850, tier: 'Master' },
  { id: 'usr_sipho', name: 'Sipho Mokoena', elo: 1780, tier: 'Diamond' },
  { id: 'usr_kagiso', name: 'Kagiso Mthembu', elo: 1540, tier: 'Gold' },
];

export default function RankedMatchmaking() {
  const { currentUser } = useAuth();
  const [inQueue, setInQueue] = useState(false);

  function handleStartQueue() {
    setInQueue(true);
  }

  const userElo = currentUser?.eloRating || 1000;
  const userTier = currentUser?.divisionTier || 'GOLD';
  const userName = currentUser?.name || currentUser?.username || 'Wits Scholar';

  // Construct ladder array with current user's database values
  let ladder = DEFAULT_SEASONS.map((s) => {
    if (
      currentUser &&
      (s.id === currentUser.id ||
        s.name.toLowerCase() === userName.toLowerCase() ||
        s.name.toLowerCase().includes((currentUser.username || '').toLowerCase()))
    ) {
      return {
        ...s,
        name: userName,
        elo: userElo,
        tier: userTier,
        isUser: true,
      };
    }
    return { ...s, isUser: false };
  });

  const hasUserInLadder = ladder.some((l) => l.isUser);
  if (currentUser && !hasUserInLadder) {
    ladder.push({
      id: currentUser.id,
      name: userName,
      elo: userElo,
      tier: userTier,
      isUser: true,
    });
  }

  // Sort ladder by Elo descending and rank
  ladder.sort((a, b) => b.elo - a.elo);
  const rankedLadder = ladder.map((l, idx) => ({ ...l, rank: idx + 1 }));

  const userRankEntry = rankedLadder.find((l) => l.isUser);
  const userRank = userRankEntry ? userRankEntry.rank : 4;

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 20%, var(--color-bg) 0%, #E5D5C5 100%)',
      paddingTop: 16, paddingBottom: 80,
    }}>
      <div style={{ padding: '14px 16px', maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 24, fontWeight: 900, color: 'var(--color-text)', margin: '0 0 4px' }}>Ranked Elo Seasons</h2>
        <p style={{ fontSize: 13, color: 'var(--color-muted)', margin: 0, fontWeight: 600 }}>Competitive seasonal ladder & Elo rating matchmaking</p>
      </div>

      {/* User Rank Card */}
      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto', marginBottom: 20 }}>
        <div style={{ background: 'var(--color-card-bg)', borderRadius: 20, padding: 24, border: '2px solid var(--color-accent)', textAlign: 'center', boxShadow: '0 8px 32px rgba(211, 122, 50, 0.1)' }}>
          <div style={{ fontSize: 11, color: 'var(--color-accent)', fontWeight: 800, letterSpacing: '0.1em' }}>YOUR CURRENT RATING</div>
          <div style={{ fontSize: 36, fontWeight: 900, color: 'var(--color-text)', margin: '8px 0' }}>1,540 Elo</div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'var(--color-muted)' }}>Diamond Tier · Rank #4 Campuswide</div>
          <div style={{ fontSize: 11, color: 'var(--color-muted)', marginTop: 12, fontWeight: 600 }}>Season 1 ends in 12 days</div>
        </div>
      </div>

      {/* Queue Action Button */}
      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto', marginBottom: 24 }}>
        {inQueue ? (
          <div style={{ background: 'var(--color-bg)', borderRadius: 16, padding: 20, textAlign: 'center', border: '2px solid var(--color-accent)', boxShadow: '0 4px 16px rgba(211, 122, 50, 0.1)' }}>
            <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--color-accent)', marginBottom: 6 }}>Searching for Opponent...</div>
            <div style={{ fontSize: 12, color: 'var(--color-muted)', fontWeight: 600 }}>Matching within ±50 Elo range</div>
            <button style={{ background: 'transparent', border: '2px solid var(--color-border)', color: 'var(--color-muted)', fontSize: 13, fontWeight: 700, padding: '10px 20px', borderRadius: 12, marginTop: 16, cursor: 'pointer' }} onClick={() => setInQueue(false)}>
              Cancel Queue
            </button>
          </div>
        ) : (
          <button style={{ width: '100%', fontSize: 15, padding: '16px', background: 'var(--color-accent)', color: 'white', fontWeight: 800, border: 'none', borderRadius: 16, cursor: 'pointer', boxShadow: '0 4px 16px rgba(211, 122, 50, 0.2)' }} onClick={handleStartQueue}>
            Find Ranked Match
          </button>
        )}
      </div>

      {/* Leaderboard preview */}
      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ background: 'var(--color-card-bg)', borderRadius: 20, padding: 20, border: '1px solid var(--color-border)', boxShadow: '0 4px 16px rgba(44, 34, 30, 0.05)' }}>
          <div style={{ fontSize: 12, fontWeight: 900, color: 'var(--color-muted)', marginBottom: 16, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Top Season 1 Ranked Competitors
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {rankedLadder.slice(0, 6).map((s) => (
              <div key={s.id || s.rank} style={{
                display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                padding: '12px 16px', borderRadius: 12,
                background: s.isUser ? 'rgba(211, 122, 50, 0.08)' : 'var(--color-bg)',
                border: `1.5px solid ${s.isUser ? 'var(--color-accent)' : 'var(--color-border)'}`,
              }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 800, color: s.isUser ? 'var(--color-accent)' : 'var(--color-text)' }}>
                    #{s.rank} {s.name}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--color-muted)', fontWeight: 600 }}>{s.tier}</div>
                </div>
                <div style={{ fontSize: 15, fontWeight: 900, color: s.isUser ? 'var(--color-accent)' : 'var(--color-text)' }}>
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
