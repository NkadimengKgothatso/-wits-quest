import { useState, useEffect } from 'react';

const PLAYER_CARDS = [
  { id: 1, name: 'Great Hall Pillars', attack: 85, defense: 95, speed: 40, brains: 90, rarity: 'Legendary' },
  { id: 2, name: "Solomon's Torch", attack: 90, defense: 70, speed: 85, brains: 88, rarity: 'Epic' },
  { id: 3, name: 'Quantum Reactor', attack: 75, defense: 60, speed: 70, brains: 95, rarity: 'Rare' },
];

const OPPONENT_CARDS = [
  { id: 101, name: 'Joburg Skyline', attack: 80, defense: 88, speed: 55, brains: 82, rarity: 'Epic' },
  { id: 102, name: 'Reef Gold', attack: 95, defense: 65, speed: 72, brains: 78, rarity: 'Legendary' },
  { id: 103, name: 'Ubuntu Spirit', attack: 60, defense: 90, speed: 60, brains: 92, rarity: 'Rare' },
];

type AttrKey = 'attack' | 'defense' | 'speed' | 'brains';

const ATTR_META: Record<AttrKey, { label: string; color: string }> = {
  attack: { label: 'ATK', color: '#f87171' },
  defense: { label: 'DEF', color: '#60a5fa' },
  speed: { label: 'SPD', color: '#facc15' },
  brains: { label: 'BRN', color: '#a78bfa' },
};

export default function LivePvPArena() {
  const [turnTime, setTurnTime] = useState(15);
  const [spectators, setSpectators] = useState(14);
  const [round, setRound] = useState(1);
  const [playerScore, setPlayerScore] = useState(0);
  const [opponentScore, setOpponentScore] = useState(0);
  const [selectedAttr, setSelectedAttr] = useState<AttrKey | null>(null);
  const [roundResult, setRoundResult] = useState<string | null>(null);

  // Turn timer countdown
  useEffect(() => {
    if (turnTime <= 0 || roundResult) return;
    const timer = setInterval(() => setTurnTime((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [turnTime, roundResult]);

  function handleSelectAttr(attr: AttrKey) {
    if (selectedAttr || roundResult) return;
    setSelectedAttr(attr);

    const playerVal = PLAYER_CARDS[0][attr];
    const opponentVal = OPPONENT_CARDS[0][attr];

    setTimeout(() => {
      if (playerVal > opponentVal) {
        setPlayerScore((s) => s + 1);
        setRoundResult('ROUND WON');
      } else if (opponentVal > playerVal) {
        setOpponentScore((s) => s + 1);
        setRoundResult('ROUND LOST');
      } else {
        setRoundResult('DRAW');
      }
    }, 600);
  }

  function handleNextRound() {
    setRound((r) => r + 1);
    setTurnTime(15);
    setSelectedAttr(null);
    setRoundResult(null);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 20%, #253d6a 0%, #1d3156 50%, #0f1a2e 100%)',
      paddingTop: 16, paddingBottom: 80,
    }}>
      {/* Header bar */}
      <div style={{ padding: '14px 16px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <div>
            <h2 style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: 0 }}>Live WebSocket Arena</h2>
            <div style={{ fontSize: 11, color: '#a4b5d1', marginTop: 2 }}>Synchronous Real-Time Card Match</div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <div style={{ background: 'rgba(176,203,230,0.15)', border: '1px solid rgba(176,203,230,0.3)', borderRadius: 20, padding: '4px 10px', fontSize: 10, color: '#b0cbe6', fontWeight: 700 }}>
              Live Sync 14ms
            </div>
            <div style={{ background: 'rgba(254,214,206,0.15)', border: '1px solid rgba(254,214,206,0.3)', borderRadius: 20, padding: '4px 10px', fontSize: 10, color: '#fed6ce', fontWeight: 700 }}>
              {spectators} Spectators Live
            </div>
          </div>
        </div>

        {/* Score & Turn Clock */}
        <div className="glass-dark" style={{ borderRadius: 16, padding: 14, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#fed6ce', fontWeight: 700 }}>YOU (Kagiso)</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>{playerScore}</div>
          </div>

          {/* Radial Timer Ring */}
          <div style={{ position: 'relative', width: 64, height: 64, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="64" height="64" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx="32" cy="32" r="26" fill="none" stroke="rgba(164,181,209,0.2)" strokeWidth="4" />
              <circle
                cx="32" cy="32" r="26" fill="none" stroke="#fed6ce" strokeWidth="4"
                strokeDasharray="163" strokeDashoffset={(163 * (15 - turnTime)) / 15}
                style={{ transition: 'stroke-dashoffset 1s linear' }}
              />
            </svg>
            <span style={{ position: 'absolute', fontSize: 16, fontWeight: 900, color: '#fed6ce' }}>
              {turnTime}s
            </span>
          </div>

          <div style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 11, color: '#b0cbe6', fontWeight: 700 }}>OPPONENT (Thabo)</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: 'white' }}>{opponentScore}</div>
          </div>
        </div>
      </div>

      {/* Arena Stage */}
      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto', display: 'flex', gap: 12, height: 260 }}>
        {/* Player Card */}
        <div className="glass-dark" style={{ flex: 1, borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #fed6ce', position: 'relative' }}>
          <div style={{ fontSize: 10, color: '#fed6ce', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 8 }}>YOUR CARD</div>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1d3156', border: '2px solid #fed6ce', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fed6ce', fontWeight: 900, fontSize: 16 }}>
            GH
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'white', marginTop: 8 }}>{PLAYER_CARDS[0].name}</div>
          <div style={{ fontSize: 10, color: '#fed6ce', marginTop: 2 }}>{PLAYER_CARDS[0].rarity}</div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', fontWeight: 900, color: '#fed6ce', fontSize: 18 }}>VS</div>

        {/* Opponent Card */}
        <div className="glass-dark" style={{ flex: 1, borderRadius: 16, padding: 14, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', border: '1.5px solid #b0cbe6', position: 'relative' }}>
          <div style={{ fontSize: 10, color: '#b0cbe6', fontWeight: 700, letterSpacing: '0.05em', marginBottom: 8 }}>OPPONENT CARD</div>
          <div style={{ width: 48, height: 48, borderRadius: '50%', background: '#1d3156', border: '2px solid #b0cbe6', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#b0cbe6', fontWeight: 900, fontSize: 16 }}>
            JS
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'white', marginTop: 8 }}>{OPPONENT_CARDS[0].name}</div>
          <div style={{ fontSize: 10, color: '#b0cbe6', marginTop: 2 }}>{OPPONENT_CARDS[0].rarity}</div>
        </div>
      </div>

      {/* Attribute Action Controls */}
      <div style={{ padding: '16px 16px 0', maxWidth: 600, margin: '0 auto' }}>
        {roundResult ? (
          <div className="glass-dark" style={{ borderRadius: 16, padding: 16, textAlign: 'center' }}>
            <div style={{ fontSize: 16, fontWeight: 900, color: '#fed6ce', marginBottom: 8 }}>{roundResult}</div>
            <button className="btn-peach" style={{ fontSize: 12, padding: '10px 24px', borderRadius: 8 }} onClick={handleNextRound}>
              Next Round →
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            {(['attack', 'defense', 'speed', 'brains'] as const).map((attr) => (
              <button
                key={attr}
                onClick={() => handleSelectAttr(attr)}
                style={{
                  background: 'rgba(73, 104, 148, 0.35)',
                  border: `1.5px solid ${selectedAttr === attr ? '#fed6ce' : 'rgba(164,181,209,0.2)'}`,
                  borderRadius: 12, padding: 12, color: 'white', cursor: 'pointer',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                }}
              >
                <span style={{ fontSize: 12, fontWeight: 700, color: ATTR_META[attr].color }}>{ATTR_META[attr].label}</span>
                <span style={{ fontSize: 14, fontWeight: 900 }}>{PLAYER_CARDS[0][attr]}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
