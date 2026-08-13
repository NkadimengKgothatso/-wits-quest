import { useState } from 'react';

const EVENTS = [
  { id: 1, title: 'Great Hall History Challenge', lat: '-26.19185', lng: '28.03023', radius: 25, card: 'Great Hall Pillars', start: '2026-08-01', end: '2026-08-31', active: true },
  { id: 2, title: 'Science Stadium STEM Quiz', lat: '-26.19320', lng: '28.02880', radius: 50, card: 'Quantum Reactor', start: '2026-08-05', end: '2026-08-20', active: true },
  { id: 3, title: 'Origins Heritage Trail', lat: '-26.19500', lng: '28.03150', radius: 30, card: 'Cave Painting', start: '2026-07-20', end: '2026-07-31', active: false },
];

export default function AdminEvents() {
  const [form, setForm] = useState({
    lat: '-26.19185',
    lng: '28.03023',
    title: '',
    radius: 25,
    start: '',
    end: '',
    card: 'Great Hall Pillars',
  });
  const [selectedPin, setSelectedPin] = useState<{ x: number; y: number } | null>(null);
  const [events, setEvents] = useState(EVENTS);
  const [saved, setSaved] = useState(false);

  function handleMapClick(e: React.MouseEvent<HTMLDivElement>) {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setSelectedPin({ x, y });
    setForm((f) => ({ ...f, lat: (-26.19 - y * 0.001).toFixed(5), lng: (28.03 + x * 0.001).toFixed(5) }));
  }

  function handleSave() {
    if (!form.title) return;
    setEvents((evs) => [
      ...evs,
      {
        id: evs.length + 1,
        title: form.title,
        lat: form.lat,
        lng: form.lng,
        radius: form.radius,
        card: form.card,
        start: form.start,
        end: form.end,
        active: true,
      },
    ]);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
    setForm((f) => ({ ...f, title: '', start: '', end: '' }));
    setSelectedPin(null);
  }

  return (
    <div style={{ display: 'flex', height: '100%', gap: 0, minHeight: 'calc(100vh - 120px)' }}>
      {/* Map canvas */}
      <div
        style={{
          flex: 1,
          background: 'radial-gradient(ellipse at 40% 50%, #6b5630 0%, #3d2f12 100%)',
          position: 'relative',
          cursor: 'crosshair',
          overflow: 'hidden',
        }}
        onClick={handleMapClick}
      >
        {/* Grid */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.05 }}>
          <defs>
            <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#dca668" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid2)" />
        </svg>

        {/* Roads */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.1 }}>
          <line x1="20%" y1="50%" x2="80%" y2="50%" stroke="#e8c99a" strokeWidth="8" strokeLinecap="round" />
          <line x1="50%" y1="20%" x2="50%" y2="80%" stroke="#e8c99a" strokeWidth="8" strokeLinecap="round" />
          <ellipse cx="50%" cy="50%" rx="35%" ry="28%" fill="none" stroke="#e8c99a" strokeWidth="3" />
        </svg>

        {/* Instruction */}
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          background: 'rgba(63, 47, 18, 0.85)', backdropFilter: 'blur(8px)',
          borderRadius: 8, padding: '6px 14px', border: '1px solid rgba(220, 166, 104, 0.2)',
          fontSize: 11, color: '#e8c99a', pointerEvents: 'none', fontWeight: 600
        }}>
          Click campus map to place target event coordinates
        </div>

        {/* Existing event pins */}
        {events.map((ev, i) => (
          <div
            key={ev.id}
            style={{
              position: 'absolute',
              top: `${30 + i * 18}%`,
              left: `${35 + i * 15}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div style={{
              width: 24, height: 24, borderRadius: '50%',
              background: ev.active ? '#dca668' : 'rgba(107, 125, 44, 0.7)',
              border: `2px solid ${ev.active ? '#dca668' : 'rgba(220, 166, 104, 0.4)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: ev.active ? '0 0 12px rgba(220, 166, 104, 0.6)' : 'none'
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#54441b' }} />
            </div>
            <div style={{
              position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)',
              whiteSpace: 'nowrap', fontSize: 9, fontWeight: 700, color: ev.active ? '#dca668' : '#dca668',
              background: 'rgba(63, 47, 18, 0.85)', padding: '2px 6px', borderRadius: 4,
              border: '1px solid rgba(220, 166, 104, 0.2)'
            }}>
              {ev.title}
            </div>
          </div>
        ))}

        {/* New pin placement */}
        {selectedPin && (
          <div
            style={{
              position: 'absolute',
              top: `${selectedPin.y}%`,
              left: `${selectedPin.x}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div style={{
              width: 28, height: 28, borderRadius: '50%',
              background: '#e8c99a',
              border: '2px solid white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(220, 166, 104, 0.8)',
              color: '#54441b', fontWeight: 900, fontSize: 14
            }}>
              +
            </div>
          </div>
        )}
      </div>

      {/* Authoring sidebar */}
      <div style={{
        width: 280,
        background: 'rgba(63, 47, 18, 0.95)',
        backdropFilter: 'blur(16px)',
        borderLeft: '1px solid rgba(220, 166, 104, 0.2)',
        padding: 16,
        display: 'flex', flexDirection: 'column', gap: 14,
        overflowY: 'auto',
      }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: 'white', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Spatial Event Placement
        </div>

        {saved && (
          <div style={{
            background: 'rgba(220, 166, 104, 0.15)', border: '1px solid rgba(220, 166, 104, 0.3)',
            borderRadius: 8, padding: '8px 12px', color: '#dca668', fontSize: 11, fontWeight: 700,
          }}>
            Event Created & Published!
          </div>
        )}

        <div>
          <label style={{ fontSize: 11, color: '#dca668', fontWeight: 600, display: 'block', marginBottom: 4 }}>
            Event Title
          </label>
          <input
            className="input-glass"
            placeholder="e.g. Great Hall History Quiz"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            style={{ fontSize: 12 }}
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: '#dca668', fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Latitude
            </label>
            <input className="input-glass" value={form.lat} readOnly style={{ fontSize: 11, color: '#dca668' }} />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 11, color: '#dca668', fontWeight: 600, display: 'block', marginBottom: 4 }}>
              Longitude
            </label>
            <input className="input-glass" value={form.lng} readOnly style={{ fontSize: 11, color: '#dca668' }} />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
            <label style={{ fontSize: 11, color: '#dca668', fontWeight: 600 }}>Activation Radius</label>
            <span style={{ fontSize: 11, color: '#dca668', fontWeight: 700 }}>{form.radius}m</span>
          </div>
          <input
            type="range" min={10} max={100} value={form.radius}
            onChange={(e) => setForm({ ...form, radius: Number(e.target.value) })}
            style={{ width: '100%', accentColor: '#dca668' }}
          />
        </div>

        <div>
          <label style={{ fontSize: 11, color: '#dca668', fontWeight: 600, display: 'block', marginBottom: 4 }}>
            Card Reward Selection
          </label>
          <select
            className="input-glass"
            value={form.card}
            onChange={(e) => setForm({ ...form, card: e.target.value })}
            style={{ fontSize: 12, color: 'white', background: '#54441b' }}
          >
            <option value="Great Hall Pillars">Great Hall Pillars (Legendary)</option>
            <option value="Solomon's Torch">Solomon's Torch (Epic)</option>
            <option value="Quantum Reactor">Quantum Reactor (Rare)</option>
            <option value="Cave Painting">Cave Painting (Common)</option>
          </select>
        </div>

        <button
          className="btn-peach"
          style={{ width: '100%', fontSize: 12, padding: '10px', marginTop: 6, borderRadius: 8 }}
          onClick={handleSave}
        >
          Save & Publish Event
        </button>

        {/* Existing events list */}
        <div style={{ marginTop: 10 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#dca668', marginBottom: 8, textTransform: 'uppercase' }}>
            Active Campus Events ({events.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {events.map((ev) => (
              <div key={ev.id} style={{
                background: 'rgba(107, 125, 44, 0.25)', border: '1px solid rgba(220, 166, 104, 0.15)',
                borderRadius: 8, padding: '8px 10px', fontSize: 11,
              }}>
                <div style={{ fontWeight: 700, color: 'white' }}>{ev.title}</div>
                <div style={{ color: '#dca668', fontSize: 10, marginTop: 2 }}>
                  Radius: {ev.radius}m · Card: {ev.card}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
