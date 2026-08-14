import { useState } from 'react';

const MY_CARDS = [
  { id: 1, name: 'Quantum Reactor', rarity: 'Rare', attack: 75, defense: 60, speed: 70, brains: 95, owned: 3 },
  { id: 2, name: 'Cave Painting', rarity: 'Common', attack: 40, defense: 50, speed: 35, brains: 78, owned: 4 },
  { id: 3, name: "Solomon's Torch", rarity: 'Epic', attack: 90, defense: 70, speed: 85, brains: 88, owned: 2 },
];

const THEIR_CARDS = [
  { id: 101, name: 'Joburg Skyline', rarity: 'Epic', attack: 80, defense: 88, speed: 55, brains: 82 },
  { id: 102, name: 'Ubuntu Spirit', rarity: 'Rare', attack: 60, defense: 90, speed: 60, brains: 92 },
  { id: 103, name: 'Origins Fossil', rarity: 'Common', attack: 38, defense: 62, speed: 28, brains: 70 },
];

const RARITY_BORDER: Record<string, string> = {
  Legendary: '#dca668', Epic: '#c99255', Rare: '#a87d4d', Common: 'rgba(220, 166, 104, 0.4)'
};

function statTotal(card: { attack: number; defense: number; speed: number; brains: number }) {
  return card.attack + card.defense + card.speed + card.brains;
}

function CardSlot({
  card,
  label,
  onClear,
  accent,
}: {
  card: typeof MY_CARDS[0] | typeof THEIR_CARDS[0] | null;
  label: string;
  onClear?: () => void;
  accent: string;
}) {
  return (
    <div style={{
      flex: 1,
      borderRadius: 14,
      border: `1.5px ${card ? 'solid' : 'dashed'} ${card ? RARITY_BORDER[card.rarity] : 'rgba(220, 166, 104, 0.3)'}`,
      background: card ? 'rgba(107, 125, 44, 0.4)' : 'rgba(84, 68, 27, 0.5)',
      padding: 14,
      textAlign: 'center',
      minHeight: 160,
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      position: 'relative',
    }}>
      <div style={{ fontSize: 10, color: accent, fontWeight: 700, letterSpacing: '0.1em', marginBottom: 4 }}>
        {label}
      </div>

      {card ? (
        <>
          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(84, 68, 27, 0.85)', border: `2px solid ${RARITY_BORDER[card.rarity]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: RARITY_BORDER[card.rarity], fontWeight: 800, fontSize: 14 }}>
            {card.name.substring(0, 2).toUpperCase()}
          </div>
          <div style={{ fontSize: 13, fontWeight: 800, color: 'white' }}>{card.name}</div>
          <div style={{ fontSize: 10, color: RARITY_BORDER[card.rarity], fontWeight: 700 }}>{card.rarity}</div>
          <div style={{ fontSize: 11, fontWeight: 800, color: '#dca668', marginTop: 2 }}>
            Total Stat: {statTotal(card)}
          </div>
          {onClear && (
            <button
              onClick={onClear}
              style={{
                position: 'absolute', top: 8, right: 8,
                background: 'rgba(107, 125, 44, 0.5)', border: 'none',
                borderRadius: '50%', width: 20, height: 20,
                color: 'white', fontSize: 10, cursor: 'pointer',
              }}
            >
              ✕
            </button>
          )}
        </>
      ) : (
        <div style={{ color: 'rgba(220, 166, 104, 0.4)', fontSize: 12, fontWeight: 600 }}>
          Select a Card
        </div>
      )}
    </div>
  );
}

export default function Trades() {
  const [myOffer, setMyOffer] = useState<typeof MY_CARDS[0] | null>(null);
  const [theirOffer, setTheirOffer] = useState<typeof THEIR_CARDS[0] | null>(null);
  const [tradeDone, setTradeDone] = useState(false);

  const myStat = myOffer ? statTotal(myOffer) : 0;
  const theirStat = theirOffer ? statTotal(theirOffer) : 0;
  const fair = Math.abs(myStat - theirStat) <= 25;

  function handleConfirm() {
    setTradeDone(true);
    setTimeout(() => {
      setTradeDone(false);
      setMyOffer(null);
      setTheirOffer(null);
    }, 2000);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 10%, #6b5630 0%, #54441b 50%, #3d2f12 100%)',
      paddingTop: 16, paddingBottom: 80,
    }}>
      <div style={{ padding: '14px 16px 0', maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: '0 0 4px' }}>Peer Card Trading</h2>
        <p style={{ fontSize: 12, color: '#dca668', margin: '0 0 16px' }}>P2P card exchange with stat fairness calculation</p>
      </div>

      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {/* Trade Mat */}
        <div className="glass-dark" style={{ borderRadius: 16, padding: 16 }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 16 }}>
            <CardSlot card={myOffer} label="YOU OFFER" onClear={() => setMyOffer(null)} accent="#dca668" />
            <div style={{ fontSize: 14, fontWeight: 900, color: '#e8c99a' }}>↔</div>
            <CardSlot card={theirOffer} label="THEIR OFFER" onClear={() => setTheirOffer(null)} accent="#e8c99a" />
          </div>

          {/* Fairness Indicator */}
          {myOffer && theirOffer && (
            <div style={{
              borderRadius: 10, padding: '10px 14px', marginBottom: 14, textAlign: 'center',
              background: fair ? 'rgba(232, 201, 154, 0.15)' : 'rgba(220, 166, 104, 0.15)',
              border: `1px solid ${fair ? 'rgba(232, 201, 154, 0.4)' : 'rgba(220, 166, 104, 0.4)'}`,
            }}>
              <div style={{ fontSize: 12, fontWeight: 800, color: fair ? '#e8c99a' : '#dca668' }}>
                {fair ? 'FAIR TRADE (±25 Stat Diff)' : 'STAT IMBALANCE'}
              </div>
              <div style={{ fontSize: 10, color: '#dca668', marginTop: 2 }}>
                {myStat} pts vs {theirStat} pts (Diff: {Math.abs(myStat - theirStat)} pts)
              </div>
            </div>
          )}

          {tradeDone ? (
            <div style={{ textAlign: 'center', color: '#dca668', fontWeight: 800, padding: 10 }}>
              Trade Completed Successfully!
            </div>
          ) : (
            <button
              className="btn-peach"
              style={{ width: '100%', fontSize: 13, padding: '12px', opacity: myOffer && theirOffer ? 1 : 0.4, borderRadius: 10 }}
              disabled={!myOffer || !theirOffer}
              onClick={handleConfirm}
            >
              Confirm Trade Exchange
            </button>
          )}
        </div>

        {/* Card Selectors */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
          {/* Your cards */}
          <div className="glass-dark" style={{ borderRadius: 14, padding: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#dca668', marginBottom: 8, textTransform: 'uppercase' }}>
              Your Duplicate Cards
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {MY_CARDS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setMyOffer(c)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderRadius: 8,
                    background: myOffer?.id === c.id ? 'rgba(220, 166, 104, 0.2)' : 'rgba(107, 125, 44, 0.25)',
                    border: `1px solid ${myOffer?.id === c.id ? '#dca668' : 'rgba(220, 166, 104, 0.15)'}`,
                    color: 'white', textAlign: 'left', cursor: 'pointer',
                  }}
                >
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#54441b', border: `1px solid ${RARITY_BORDER[c.rarity]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: RARITY_BORDER[c.rarity], fontWeight: 800, fontSize: 9 }}>
                    {c.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>{c.name}</div>
                    <div style={{ fontSize: 9, color: '#dca668' }}>×{c.owned} · {statTotal(c)} pts</div>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Partner cards */}
          <div className="glass-dark" style={{ borderRadius: 14, padding: 12 }}>
            <div style={{ fontSize: 10, fontWeight: 700, color: '#e8c99a', marginBottom: 8, textTransform: 'uppercase' }}>
              Partner Available Cards
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {THEIR_CARDS.map((c) => (
                <button
                  key={c.id}
                  onClick={() => setTheirOffer(c)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8, padding: 8, borderRadius: 8,
                    background: theirOffer?.id === c.id ? 'rgba(232, 201, 154, 0.2)' : 'rgba(107, 125, 44, 0.25)',
                    border: `1px solid ${theirOffer?.id === c.id ? '#e8c99a' : 'rgba(220, 166, 104, 0.15)'}`,
                    color: 'white', textAlign: 'left', cursor: 'pointer',
                  }}
                >
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#54441b', border: `1px solid ${RARITY_BORDER[c.rarity]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: RARITY_BORDER[c.rarity], fontWeight: 800, fontSize: 9 }}>
                    {c.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 700 }}>{c.name}</div>
                    <div style={{ fontSize: 9, color: '#dca668' }}>{statTotal(c)} pts</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
