import { useState } from 'react';

// Wits campus landmarks data
const LANDMARKS = [
  {
    id: 'great-hall',
    name: 'The Great Hall',
    category: 'Wits History',
    x: 50,
    y: 42,
    distance: 12,
    status: 'in-reach' as const,
    rarity: 'Legendary',
    cardName: 'Great Hall Pillars',
  },
  {
    id: 'solomon',
    name: 'Solomon Mahlangu House',
    category: 'Campus Life',
    x: 63,
    y: 55,
    distance: 18,
    status: 'in-reach' as const,
    rarity: 'Epic',
    cardName: "Solomon's Torch",
  },
  {
    id: 'senate-house',
    name: 'Senate House',
    category: 'Administration',
    x: 38,
    y: 60,
    distance: 87,
    status: 'far' as const,
    rarity: 'Rare',
    cardName: 'Senate Seal',
  },
  {
    id: 'cullen-library',
    name: 'Cullen Library',
    category: 'Knowledge',
    x: 70,
    y: 35,
    distance: 134,
    status: 'far' as const,
    rarity: 'Epic',
    cardName: 'Ancient Tome',
  },
  {
    id: 'science-stadium',
    name: 'Science Stadium',
    category: 'STEM',
    x: 28,
    y: 48,
    distance: 210,
    status: 'far' as const,
    rarity: 'Rare',
    cardName: 'Quantum Reactor',
  },
  {
    id: 'origins-museum',
    name: 'Origins Centre',
    category: 'Heritage',
    x: 57,
    y: 70,
    distance: 45,
    status: 'far' as const,
    rarity: 'Common',
    cardName: 'Cave Painting',
  },
];

// Nearby active Wits student players
const NEARBY_PLAYERS = [
  { id: 'p1', name: 'Thabo Nkosi', initials: 'TN', level: 28, rank: '#1 Diamond', x: 62, y: 52 },
  { id: 'p2', name: 'Lerato Dlamini', initials: 'LD', level: 25, rank: '#2 Diamond', x: 68, y: 38 },
  { id: 'p3', name: 'Sipho Mokoena', initials: 'SM', level: 24, rank: '#3 Platinum', x: 32, y: 50 },
];

interface MapExplorerProps {
  onOpenTrivia: (landmark: typeof LANDMARKS[0]) => void;
}

export default function MapExplorer({ onOpenTrivia }: MapExplorerProps) {
  const [simDistance, setSimDistance] = useState(12);
  const [showSidebar, setShowSidebar] = useState(true);
  const [selectedLandmark, setSelectedLandmark] = useState(LANDMARKS[0]);
  const [activePlayerModal, setActivePlayerModal] = useState<typeof NEARBY_PLAYERS[0] | null>(null);

  const activeLandmarks = LANDMARKS.map((l) => ({
    ...l,
    status: l.distance <= simDistance ? ('in-reach' as const) : ('far' as const),
  }));

  const nearest = activeLandmarks.find((l) => l.status === 'in-reach') ?? activeLandmarks[0];

  return (
    <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 162px)', overflow: 'hidden' }}>
      {/* Map Canvas — simulated dark tile map */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at 40% 50%, #1a2e4a 0%, #111e36 60%, #0a1525 100%)',
        }}
      >
        {/* Grid lines simulating map tiles */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.06 }}>
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#a4b5d1" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Campus road network SVG */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
          {/* Main roads */}
          <line x1="20%" y1="50%" x2="80%" y2="50%" stroke="#b0cbe6" strokeWidth="8" strokeLinecap="round" />
          <line x1="50%" y1="20%" x2="50%" y2="80%" stroke="#b0cbe6" strokeWidth="8" strokeLinecap="round" />
          <line x1="25%" y1="30%" x2="75%" y2="70%" stroke="#b0cbe6" strokeWidth="4" strokeLinecap="round" />
          <line x1="75%" y1="30%" x2="25%" y2="70%" stroke="#b0cbe6" strokeWidth="4" strokeLinecap="round" />
          {/* Campus ring road */}
          <ellipse cx="50%" cy="50%" rx="35%" ry="28%" fill="none" stroke="#b0cbe6" strokeWidth="3" />
          {/* Building footprints */}
          {[
            { x: '44%', y: '37%', w: 60, h: 45 },
            { x: '57%', y: '49%', w: 50, h: 40 },
            { x: '32%', y: '54%', w: 55, h: 38 },
            { x: '64%', y: '29%', w: 65, h: 42 },
            { x: '22%', y: '42%', w: 45, h: 35 },
          ].map((b, i) => (
            <rect key={i} x={b.x} y={b.y} width={b.w} height={b.h} fill="rgba(176, 203, 230, 0.2)" rx="4" />
          ))}
        </svg>

        {/* Campus label */}
        <div style={{
          position: 'absolute', top: '14%', left: '50%', transform: 'translateX(-50%)',
          color: 'rgba(164, 181, 209, 0.5)', fontSize: 11, fontWeight: 700,
          letterSpacing: '0.18em', textTransform: 'uppercase',
        }}>
          University of the Witwatersrand
        </div>

        {/* User GPS dot */}
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
          {/* Activation radius ring */}
          <div
            style={{
              position: 'absolute',
              top: '50%',
              left: '50%',
              transform: 'translate(-50%, -50%)',
              width: Math.min(simDistance * 3, 180),
              height: Math.min(simDistance * 3, 180),
              borderRadius: '50%',
              border: '1.5px solid rgba(176, 203, 230, 0.5)',
              background: 'rgba(176, 203, 230, 0.06)',
              transition: 'all 0.4s ease',
            }}
          />
          {/* Pulse rings */}
          <div
            style={{
              position: 'absolute', top: '50%', left: '50%',
              transform: 'translate(-50%, -50%)',
              width: 20, height: 20, borderRadius: '50%',
              background: 'rgba(176, 203, 230, 0.3)',
              animation: 'pulse-ring 2s ease-out infinite',
            }}
          />
          {/* Center dot */}
          <div
            className="pulse-dot"
            style={{
              width: 14, height: 14, borderRadius: '50%',
              background: '#b0cbe6',
              border: '2px solid white',
              boxShadow: '0 0 12px rgba(176, 203, 230, 0.8)',
              position: 'relative',
            }}
          />
        </div>

        {/* Landmark pins */}
        {activeLandmarks.map((lm) => (
          <button
            key={lm.id}
            onClick={() => {
              setSelectedLandmark(lm);
              if (lm.status === 'in-reach') onOpenTrivia(lm);
            }}
            style={{
              position: 'absolute',
              top: `${lm.y}%`,
              left: `${lm.x}%`,
              transform: 'translate(-50%, -50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              zIndex: 10,
            }}
          >
            <div
              className={lm.status === 'in-reach' ? 'pin-active' : ''}
              style={{
                width: 28,
                height: 28,
                borderRadius: '50%',
                background: lm.status === 'in-reach'
                  ? 'linear-gradient(135deg, #fed6ce, #f5b8ac)'
                  : 'rgba(73, 104, 148, 0.7)',
                border: `2px solid ${lm.status === 'in-reach' ? '#fed6ce' : 'rgba(164, 181, 209, 0.4)'}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.3s',
                boxShadow: lm.status === 'in-reach' ? '0 0 16px rgba(254, 214, 206, 0.6)' : 'none'
              }}
            >
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: lm.status === 'in-reach' ? '#1d3156' : '#a4b5d1' }} />
            </div>
            {/* Label */}
            <div style={{
              position: 'absolute',
              top: 32,
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              fontSize: 10,
              fontWeight: 700,
              color: lm.status === 'in-reach' ? '#fed6ce' : '#a4b5d1',
              textShadow: '0 1px 4px rgba(0,0,0,0.8)',
              background: 'rgba(17, 30, 54, 0.85)',
              padding: '2px 8px',
              borderRadius: 6,
              border: '1px solid rgba(164, 181, 209, 0.2)'
            }}>
              {lm.name}
            </div>
          </button>
        ))}

        {/* Nearby Active Wits Student Player Avatars */}
        {NEARBY_PLAYERS.map((p) => (
          <button
            key={p.id}
            onClick={() => setActivePlayerModal(p)}
            style={{
              position: 'absolute',
              top: `${p.y}%`,
              left: `${p.x}%`,
              transform: 'translate(-50%, -50%)',
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              zIndex: 15,
            }}
          >
            <div style={{
              width: 30,
              height: 30,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #496894, #1d3156)',
              border: '2px solid #fed6ce',
              boxShadow: '0 0 12px rgba(254, 214, 206, 0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 800,
              color: '#fed6ce',
              fontSize: 10,
            }}>
              {p.initials}
            </div>
            <div style={{
              position: 'absolute',
              top: 32,
              left: '50%',
              transform: 'translateX(-50%)',
              whiteSpace: 'nowrap',
              fontSize: 9,
              fontWeight: 700,
              color: '#white',
              background: 'rgba(29, 49, 86, 0.9)',
              padding: '1px 6px',
              borderRadius: 4,
              border: '1px solid rgba(254, 214, 206, 0.4)'
            }}>
              {p.name}
            </div>
          </button>
        ))}
      </div>

      {/* Floating sidebar — GPS Simulator */}
      {showSidebar && (
        <div
          className="glass slide-up"
          style={{
            position: 'absolute',
            right: 12,
            top: '50%',
            transform: 'translateY(-50%)',
            width: 220,
            padding: 16,
            zIndex: 30,
          }}
        >
          <div style={{ fontSize: 11, fontWeight: 800, color: '#b0cbe6', marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            GPS Location Simulator
          </div>

          <div style={{ fontSize: 11, color: '#fed6ce', marginBottom: 4, fontWeight: 600 }}>
            {simDistance}m from Great Hall
          </div>
          <div style={{
            fontSize: 10,
            color: simDistance <= 25 ? '#fed6ce' : '#a4b5d1',
            marginBottom: 10,
            fontWeight: 700,
            letterSpacing: '0.05em'
          }}>
            {simDistance <= 25 ? 'IN RADIUS (<25m)' : 'OUT OF RANGE (>25m)'}
          </div>

          <input
            type="range"
            min={5}
            max={300}
            value={simDistance}
            onChange={(e) => setSimDistance(Number(e.target.value))}
            style={{ width: '100%', marginBottom: 14, accentColor: '#fed6ce' }}
          />

          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 10, color: '#a4b5d1', marginBottom: 6, fontWeight: 600 }}>In Range Landmarks</div>
            {activeLandmarks.filter((l) => l.status === 'in-reach').map((l) => (
              <div key={l.id} style={{
                fontSize: 11, color: '#fed6ce', fontWeight: 600,
                padding: '4px 0', borderBottom: '1px solid rgba(164,181,209,0.1)',
                display: 'flex', alignItems: 'center', gap: 6
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#fed6ce' }} />
                {l.name}
              </div>
            ))}
            {activeLandmarks.filter((l) => l.status === 'in-reach').length === 0 && (
              <div style={{ fontSize: 10, color: '#a4b5d1', opacity: 0.6 }}>None in range</div>
            )}
          </div>

          {activeLandmarks.some((l) => l.status === 'in-reach') && (
            <button
              className="btn-peach"
              style={{ width: '100%', fontSize: 12, padding: '10px 8px', borderRadius: 8 }}
              onClick={() => onOpenTrivia(nearest)}
            >
              Unlock Event
            </button>
          )}

          <div style={{ marginTop: 10, display: 'flex', gap: 6 }}>
            <button className="btn-ghost" style={{ flex: 1, fontSize: 10, padding: '6px 4px', borderRadius: 6 }}>
              Center
            </button>
            <button className="btn-ghost" style={{ flex: 1, fontSize: 10, padding: '6px 4px', borderRadius: 6 }}>
              Target Nearest
            </button>
          </div>
        </div>
      )}

      {/* Sidebar toggle button */}
      <button
        onClick={() => setShowSidebar(!showSidebar)}
        style={{
          position: 'absolute',
          right: showSidebar ? 240 : 12,
          top: '50%',
          transform: 'translateY(-50%)',
          zIndex: 31,
          background: 'rgba(29, 49, 86, 0.9)',
          backdropFilter: 'blur(8px)',
          border: '1px solid rgba(164, 181, 209, 0.3)',
          borderRadius: 8,
          color: '#a4b5d1',
          fontSize: 14,
          width: 28,
          height: 48,
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          transition: 'right 0.3s',
        }}
      >
        {showSidebar ? '›' : '‹'}
      </button>

      {/* Quick event info popup (bottom left) */}
      <div
        className="glass-dark"
        style={{
          position: 'absolute',
          bottom: 80,
          left: 12,
          padding: '10px 14px',
          maxWidth: 200,
          zIndex: 20,
        }}
      >
        <div style={{ fontSize: 10, color: '#b0cbe6', fontWeight: 700, marginBottom: 4, letterSpacing: '0.05em' }}>
          ACTIVE LANDMARK
        </div>
        <div style={{ fontSize: 13, color: 'white', fontWeight: 700 }}>Great Hall</div>
        <div style={{ fontSize: 10, color: '#a4b5d1' }}>Wits History · 12m · Legendary</div>
      </div>

      {/* Map legend */}
      <div
        className="glass-dark"
        style={{
          position: 'absolute',
          bottom: 80,
          right: 12,
          padding: '10px 14px',
          zIndex: 20,
        }}
      >
        <div style={{ fontSize: 9, color: '#a4b5d1', fontWeight: 700, marginBottom: 6, letterSpacing: '0.1em' }}>
          LEGEND
        </div>
        {[
          { color: '#fed6ce', label: 'Landmark In Reach' },
          { color: '#a4b5d1', label: 'Too Far' },
          { color: '#b0cbe6', label: 'Your GPS Fix' },
        ].map((item) => (
          <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
            <span style={{ fontSize: 9, color: '#a4b5d1' }}>{item.label}</span>
          </div>
        ))}
      </div>

      {/* Nearby Player Interaction Modal */}
      {activePlayerModal && (
        <div
          style={{
            position: 'fixed', inset: 0, background: 'rgba(13, 22, 45, 0.8)',
            backdropFilter: 'blur(12px)', zIndex: 100,
            display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16
          }}
          onClick={(e) => e.target === e.currentTarget && setActivePlayerModal(null)}
        >
          <div className="glass-modal slide-up" style={{ width: '100%', maxWidth: 360, padding: 24, textAlign: 'center' }}>
            <div style={{ width: 52, height: 52, borderRadius: '50%', background: '#496894', border: '2px solid #fed6ce', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fed6ce', fontWeight: 900, fontSize: 18, margin: '0 auto 10px' }}>
              {activePlayerModal.initials}
            </div>
            <div style={{ fontSize: 16, fontWeight: 900, color: 'white' }}>{activePlayerModal.name}</div>
            <div style={{ fontSize: 11, color: '#fed6ce', fontWeight: 700, marginBottom: 16 }}>
              Level {activePlayerModal.level} Explorer · {activePlayerModal.rank}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button className="btn-peach" style={{ width: '100%', fontSize: 12, padding: '10px', borderRadius: 8 }} onClick={() => setActivePlayerModal(null)}>
                Challenge to Live PvP Battle
              </button>
              <button className="btn-ghost" style={{ width: '100%', fontSize: 12, padding: '10px', borderRadius: 8 }} onClick={() => setActivePlayerModal(null)}>
                Propose Card Trade
              </button>
              <button className="btn-ghost" style={{ width: '100%', fontSize: 12, padding: '10px', borderRadius: 8 }} onClick={() => setActivePlayerModal(null)}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
