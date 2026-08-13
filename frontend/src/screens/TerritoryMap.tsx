import { useState } from 'react';

const PRECINCTS = [
  { id: 'east', name: 'East Campus Quadrant', control: 68, leader: 'Kudu Faction', color: '#dca668', landmarks: ['Great Hall', 'Senate House', 'Cullen Library'] },
  { id: 'west', name: 'West Campus Engineering Zone', control: 42, leader: 'Torch Faction', color: '#e8c99a', landmarks: ['Science Stadium', 'Chamber of Mines'] },
  { id: 'health', name: 'Health Sciences Precinct', control: 85, leader: 'Kudu Faction', color: '#dca668', landmarks: ['Medical School', 'Wits Clinic'] },
];

export default function TerritoryMap() {
  const [selectedPrecinct, setSelectedPrecinct] = useState(PRECINCTS[0]);
  const [claimed, setClaimed] = useState(false);

  function handleClaim() {
    setClaimed(true);
    setTimeout(() => setClaimed(false), 2000);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 20%, #6b5630 0%, #54441b 50%, #3d2f12 100%)',
      paddingTop: 16, paddingBottom: 80,
    }}>
      <div style={{ padding: '14px 16px', maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: '0 0 4px' }}>Campus Territory Control</h2>
        <p style={{ fontSize: 12, color: '#dca668', margin: 0 }}>Faction zone influence across Wits University precincts</p>
      </div>

      {/* Map visual polygon representation */}
      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto', marginBottom: 16 }}>
        <div className="glass-dark" style={{ height: 200, borderRadius: 16, position: 'relative', overflow: 'hidden', border: '1px solid rgba(220, 166, 104, 0.2)' }}>
          <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%' }}>
            {/* East precinct polygon */}
            <polygon points="10,20 180,10 220,120 40,150" fill="rgba(220, 166, 104, 0.18)" stroke="#dca668" strokeWidth="2" />
            {/* West precinct polygon */}
            <polygon points="230,10 420,30 380,180 240,140" fill="rgba(232, 201, 154, 0.15)" stroke="#e8c99a" strokeWidth="2" />
            {/* Health precinct polygon */}
            <polygon points="430,40 580,20 560,190 410,170" fill="rgba(220, 166, 104, 0.12)" stroke="#dca668" strokeWidth="2" />
          </svg>
          <div style={{ position: 'absolute', top: 30, left: 50, fontSize: 11, fontWeight: 800, color: '#dca668' }}>EAST CAMPUS (68%)</div>
          <div style={{ position: 'absolute', top: 40, left: 260, fontSize: 11, fontWeight: 800, color: '#e8c99a' }}>WEST CAMPUS (42%)</div>
          <div style={{ position: 'absolute', top: 50, left: 440, fontSize: 11, fontWeight: 800, color: '#dca668' }}>HEALTH PRECINCT (85%)</div>
        </div>
      </div>

      {/* Precinct list */}
      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
        {PRECINCTS.map((p) => (
          <div
            key={p.id}
            className="glass-dark"
            style={{
              borderRadius: 14, padding: 14,
              border: `1.5px solid ${selectedPrecinct.id === p.id ? '#dca668' : 'rgba(220, 166, 104, 0.2)'}`,
              cursor: 'pointer',
            }}
            onClick={() => setSelectedPrecinct(p)}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
              <span style={{ fontSize: 14, fontWeight: 800, color: 'white' }}>{p.name}</span>
              <span style={{ fontSize: 11, fontWeight: 800, color: p.color }}>{p.leader} ({p.control}%)</span>
            </div>

            {/* Influence Bar */}
            <div className="stat-bar-track" style={{ height: 6, marginBottom: 10 }}>
              <div className="stat-bar-fill" style={{ width: `${p.control}%`, background: p.color }} />
            </div>

            <div style={{ fontSize: 10, color: '#dca668' }}>
              Key Landmarks: {p.landmarks.join(' · ')}
            </div>
          </div>
        ))}

        {claimed ? (
          <div style={{ background: 'rgba(220, 166, 104, 0.15)', border: '1px solid rgba(220, 166, 104, 0.3)', borderRadius: 12, padding: 12, textAlign: 'center', color: '#dca668', fontWeight: 800, fontSize: 12 }}>
            Territory Contest Challenge Initiated!
          </div>
        ) : (
          <button
            className="btn-peach"
            style={{ width: '100%', fontSize: 13, padding: '12px', borderRadius: 10 }}
            onClick={handleClaim}
          >
            Contest & Claim {selectedPrecinct.name}
          </button>
        )}
      </div>
    </div>
  );
}
