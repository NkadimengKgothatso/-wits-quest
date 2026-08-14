import { useState } from 'react';

const FORGEABLE_CARDS = [
  { id: 1, name: 'Great Hall Pillars', rarity: 'Legendary', attack: 85, defense: 95, speed: 40, brains: 90, level: 1, duplicateCards: 3 },
  { id: 2, name: "Solomon's Torch", rarity: 'Epic', attack: 90, defense: 70, speed: 85, brains: 88, level: 2, duplicateCards: 5 },
  { id: 3, name: 'Quantum Reactor', rarity: 'Rare', attack: 75, defense: 60, speed: 70, brains: 95, level: 1, duplicateCards: 2 },
];

export default function CardForge() {
  const [selected, setSelected] = useState(FORGEABLE_CARDS[0]);
  const [essence, setEssence] = useState(480);
  const [upgraded, setUpgraded] = useState(false);

  function handleUpgrade() {
    if (essence < 100 || selected.duplicateCards < 2) return;
    setEssence((e) => e - 100);
    setUpgraded(true);
    setTimeout(() => setUpgraded(false), 2000);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 20%, #6b5630 0%, #54441b 50%, #3d2f12 100%)',
      paddingTop: 16, paddingBottom: 80,
    }}>
      <div style={{ padding: '14px 16px', maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: '0 0 4px' }}>Card Crafting Forge</h2>
        <p style={{ fontSize: 12, color: '#dca668', margin: 0 }}>Break down duplicates & upgrade card stats with Essence</p>
      </div>

      {/* Currency Balance Header */}
      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto', marginBottom: 16 }}>
        <div className="glass-dark" style={{ borderRadius: 14, padding: '10px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 11, color: '#dca668', fontWeight: 700 }}>ESSENCE BALANCE</span>
          <span style={{ fontSize: 16, fontWeight: 900, color: '#dca668' }}>{essence} Essence Shards</span>
        </div>
      </div>

      {/* Selected Card Forge View */}
      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto', marginBottom: 20 }}>
        <div className="glass-dark" style={{ borderRadius: 16, padding: 18, border: '1.5px solid #dca668', textAlign: 'center' }}>
          <div style={{ width: 54, height: 54, borderRadius: '50%', background: '#54441b', border: '2px solid #dca668', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dca668', fontWeight: 900, fontSize: 18, margin: '0 auto 10px' }}>
            {selected.name.substring(0, 2).toUpperCase()}
          </div>
          <div style={{ fontSize: 16, fontWeight: 900, color: 'white' }}>{selected.name}</div>
          <div style={{ fontSize: 11, color: '#dca668', fontWeight: 700, margin: '2px 0 12px' }}>Level {selected.level} Card</div>

          {/* Upgraded Stats Preview */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr', gap: 6, marginBottom: 16 }}>
            <div style={{ background: 'rgba(84, 68, 27, 0.7)', padding: 8, borderRadius: 8 }}>
              <div style={{ fontSize: 9, color: '#dca668' }}>ATK</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#f87171' }}>{selected.attack} (+5)</div>
            </div>
            <div style={{ background: 'rgba(84, 68, 27, 0.7)', padding: 8, borderRadius: 8 }}>
              <div style={{ fontSize: 9, color: '#dca668' }}>DEF</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#dca668' }}>{selected.defense} (+5)</div>
            </div>
            <div style={{ background: 'rgba(84, 68, 27, 0.7)', padding: 8, borderRadius: 8 }}>
              <div style={{ fontSize: 9, color: '#dca668' }}>SPD</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#facc15' }}>{selected.speed} (+5)</div>
            </div>
            <div style={{ background: 'rgba(84, 68, 27, 0.7)', padding: 8, borderRadius: 8 }}>
              <div style={{ fontSize: 9, color: '#dca668' }}>BRN</div>
              <div style={{ fontSize: 13, fontWeight: 900, color: '#e8c99a' }}>{selected.brains} (+5)</div>
            </div>
          </div>

          {upgraded ? (
            <div style={{ color: '#dca668', fontWeight: 900, fontSize: 13, padding: 8 }}>
              Card Upgraded to Level {selected.level + 1}! (+5 All Stats)
            </div>
          ) : (
            <button
              className="btn-peach"
              style={{ width: '100%', fontSize: 13, padding: '12px', borderRadius: 10 }}
              onClick={handleUpgrade}
            >
              Upgrade Card (100 Essence + 2 Duplicates)
            </button>
          )}
        </div>
      </div>

      {/* Selectable Cards List */}
      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto' }}>
        <div style={{ fontSize: 11, fontWeight: 800, color: '#e8c99a', marginBottom: 10, textTransform: 'uppercase' }}>
          Select Card to Upgrade
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FORGEABLE_CARDS.map((c) => (
            <div
              key={c.id}
              className="glass-dark"
              style={{
                borderRadius: 12, padding: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                border: `1px solid ${selected.id === c.id ? '#dca668' : 'rgba(220, 166, 104, 0.15)'}`,
                cursor: 'pointer',
              }}
              onClick={() => setSelected(c)}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#54441b', border: '1px solid #dca668', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#dca668', fontWeight: 800, fontSize: 11 }}>
                  {c.name.substring(0, 2).toUpperCase()}
                </div>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: 'white' }}>{c.name}</div>
                  <div style={{ fontSize: 10, color: '#dca668' }}>Level {c.level} · {c.rarity}</div>
                </div>
              </div>
              <div style={{ fontSize: 11, color: '#dca668', fontWeight: 700 }}>
                {c.duplicateCards} Duplicates
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
