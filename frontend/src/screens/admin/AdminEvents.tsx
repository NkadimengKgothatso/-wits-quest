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
          background: 'radial-gradient(ellipse at 40% 50%, #FAF7F2 0%, #E5D5C5 100%)',
          position: 'relative',
          cursor: 'crosshair',
          overflow: 'hidden',
        }}
        onClick={handleMapClick}
      >
        {/* Grid */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.15 }}>
          <defs>
            <pattern id="grid2" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--color-accent)" strokeWidth="0.5" />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid2)" />
        </svg>

        {/* Roads */}
        <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.2 }}>
          <line x1="20%" y1="50%" x2="80%" y2="50%" stroke="var(--color-accent)" strokeWidth="8" strokeLinecap="round" />
          <line x1="50%" y1="20%" x2="50%" y2="80%" stroke="var(--color-accent)" strokeWidth="8" strokeLinecap="round" />
          <ellipse cx="50%" cy="50%" rx="35%" ry="28%" fill="none" stroke="var(--color-accent)" strokeWidth="3" />
        </svg>

        {/* Instruction */}
        <div style={{
          position: 'absolute', top: 12, left: '50%', transform: 'translateX(-50%)',
          background: 'var(--color-card-bg)', backdropFilter: 'blur(8px)',
          borderRadius: 8, padding: '6px 14px', border: '1px solid var(--color-border)',
          fontSize: 12, color: 'var(--color-text)', pointerEvents: 'none', fontWeight: 700,
          boxShadow: '0 4px 12px rgba(44, 34, 30, 0.05)'
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
              background: ev.active ? 'var(--color-accent)' : 'var(--color-muted)',
              border: `2px solid ${ev.active ? 'var(--color-accent)' : 'var(--color-border)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: ev.active ? '0 0 12px rgba(211, 122, 50, 0.4)' : 'none'
            }}>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'white' }} />
            </div>
            <div style={{
              position: 'absolute', top: 28, left: '50%', transform: 'translateX(-50%)',
              whiteSpace: 'nowrap', fontSize: 10, fontWeight: 800, color: 'var(--color-text)',
              background: 'var(--color-card-bg)', padding: '2px 6px', borderRadius: 4,
              border: '1px solid var(--color-border)', boxShadow: '0 2px 8px rgba(44, 34, 30, 0.05)'
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
              background: 'var(--color-accent)',
              border: '2px solid white',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 16px rgba(211, 122, 50, 0.6)',
              color: 'white', fontWeight: 900, fontSize: 16
            }}>
              +
            </div>
          </div>
        )}
      </div>

      {/* Authoring sidebar */}
      <div style={{
        width: 320,
        background: 'var(--color-card-bg)',
        borderLeft: '1px solid var(--color-border)',
        padding: 20,
        display: 'flex', flexDirection: 'column', gap: 16,
        overflowY: 'auto',
      }}>
        <div style={{ fontSize: 14, fontWeight: 900, color: 'var(--color-text)', letterSpacing: '0.05em', textTransform: 'uppercase' }}>
          Spatial Event Placement
        </div>

        {saved && (
          <div style={{
            background: 'rgba(74, 124, 89, 0.1)', border: '1.5px solid var(--color-success)',
            borderRadius: 12, padding: '10px 14px', color: 'var(--color-success)', fontSize: 13, fontWeight: 700,
          }}>
            Event Created & Published!
          </div>
        )}

        <div>
          <label style={{ fontSize: 12, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
            Event Title
          </label>
          <input
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', fontSize: 13 }}
            placeholder="e.g. Great Hall History Quiz"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              Latitude
            </label>
            <input style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', fontSize: 12 }} value={form.lat} readOnly />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ fontSize: 12, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
              Longitude
            </label>
            <input style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', fontSize: 12 }} value={form.lng} readOnly />
          </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
            <label style={{ fontSize: 12, color: 'var(--color-text)', fontWeight: 700 }}>Activation Radius</label>
            <span style={{ fontSize: 12, color: 'var(--color-accent)', fontWeight: 800 }}>{form.radius}m</span>
          </div>
          <input
            type="range" min={10} max={100} value={form.radius}
            onChange={(e) => setForm({ ...form, radius: Number(e.target.value) })}
            style={{ width: '100%', accentColor: 'var(--color-accent)' }}
          />
        </div>

        <div>
          <label style={{ fontSize: 12, color: 'var(--color-text)', fontWeight: 700, display: 'block', marginBottom: 6 }}>
            Card Reward Selection
          </label>
          <select
            style={{ width: '100%', padding: '10px 14px', borderRadius: 10, border: '2px solid var(--color-border)', background: 'var(--color-bg)', color: 'var(--color-text)', outline: 'none', fontSize: 13 }}
            value={form.card}
            onChange={(e) => setForm({ ...form, card: e.target.value })}
          >
            <option value="Great Hall Pillars">Great Hall Pillars (Legendary)</option>
            <option value="Solomon's Torch">Solomon's Torch (Epic)</option>
            <option value="Quantum Reactor">Quantum Reactor (Rare)</option>
            <option value="Cave Painting">Cave Painting (Common)</option>
          </select>
        </div>

        <button
          style={{ width: '100%', fontSize: 14, padding: '12px', marginTop: 8, borderRadius: 10, background: 'var(--color-accent)', color: 'white', fontWeight: 800, border: 'none', cursor: 'pointer' }}
          onClick={handleSave}
        >
          Save & Publish Event
        </button>

        {/* Existing events list */}
        <div style={{ marginTop: 16 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: 'var(--color-muted)', marginBottom: 12, textTransform: 'uppercase' }}>
            Active Campus Events ({events.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {events.map((ev) => (
              <div key={ev.id} style={{
                background: 'var(--color-bg)', border: '1px solid var(--color-border)',
                borderRadius: 10, padding: '10px 12px', fontSize: 13,
              }}>
                <div style={{ fontWeight: 800, color: 'var(--color-text)' }}>{ev.title}</div>
                <div style={{ color: 'var(--color-muted)', fontSize: 11, marginTop: 4, fontWeight: 600 }}>
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
