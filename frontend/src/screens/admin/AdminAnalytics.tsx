import { useState } from 'react';

type TimeFilter = 'today' | '7days' | 'alltime';

const DAP_DATA = [
  { day: 'Mon', players: 312 }, { day: 'Tue', players: 285 }, { day: 'Wed', players: 398 },
  { day: 'Thu', players: 420 }, { day: 'Fri', players: 356 }, { day: 'Sat', players: 198 },
  { day: 'Sun', players: 145 },
];
const MAX_DAP = 420;

const CARD_ECONOMY = [
  { label: 'Great Hall', earned: 245, scrapped: 48 },
  { label: "Solomon's", earned: 198, scrapped: 62 },
  { label: 'Quantum', earned: 312, scrapped: 89 },
  { label: 'Senate', earned: 156, scrapped: 30 },
  { label: 'Cave Paint', earned: 420, scrapped: 198 },
];

const TRIVIA_RATES = [
  { label: 'Great Hall', pass: 68, fail: 32 },
  { label: 'Science Stadium', pass: 45, fail: 55 },
  { label: 'Origins Centre', pass: 72, fail: 28 },
  { label: 'Senate House', pass: 38, fail: 62 },
];

const HEAT_ZONES = [
  { x: '50%', y: '42%', size: 80, intensity: 1.0 },
  { x: '63%', y: '55%', size: 60, intensity: 0.75 },
  { x: '38%', y: '60%', size: 45, intensity: 0.5 },
  { x: '70%', y: '35%', size: 50, intensity: 0.6 },
  { x: '28%', y: '48%', size: 35, intensity: 0.4 },
  { x: '57%', y: '70%', size: 30, intensity: 0.35 },
];

export default function AdminAnalytics() {
  const [timeFilter, setTimeFilter] = useState<TimeFilter>('7days');

  return (
    <div style={{ padding: '16px', overflowY: 'auto' }}>
      <div style={{ marginBottom: 14 }}>
        <h2 style={{ fontSize: 20, fontWeight: 800, color: 'white', margin: '0 0 4px' }}>Campus Analytics & Spatial Heatmaps</h2>
        <p style={{ fontSize: 12, color: '#a4b5d1', margin: 0 }}>Campus foot-traffic density and card economy telemetry</p>
      </div>

      {/* Time filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
        {([['today', 'Today'], ['7days', '7 Days'], ['alltime', 'All Time']] as const).map(([v, label]) => (
          <button
            key={v}
            className={`tab-pill ${timeFilter === v ? 'active' : ''}`}
            onClick={() => setTimeFilter(v)}
            style={{ borderRadius: 8 }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Grid dashboard */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 14 }}>
        {/* Foot-traffic heatmap preview */}
        <div className="glass-dark" style={{ borderRadius: 14, padding: 14, gridColumn: 'span 2' }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#b0cbe6', marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Campus Foot-Traffic Heatmap Density
          </div>
          <div style={{
            height: 220, borderRadius: 10, position: 'relative', overflow: 'hidden',
            background: 'radial-gradient(ellipse at 40% 50%, #1a2e4a 0%, #111e36 100%)',
            border: '1px solid rgba(164, 181, 209, 0.2)',
          }}>
            {/* Road lines */}
            <svg style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', opacity: 0.12 }}>
              <line x1="20%" y1="50%" x2="80%" y2="50%" stroke="#b0cbe6" strokeWidth="6" />
              <line x1="50%" y1="20%" x2="50%" y2="80%" stroke="#b0cbe6" strokeWidth="6" />
              <ellipse cx="50%" cy="50%" rx="35%" ry="28%" fill="none" stroke="#b0cbe6" strokeWidth="2" />
            </svg>

            {/* Heat zones */}
            {HEAT_ZONES.map((h, i) => (
              <div
                key={i}
                className="heat-zone"
                style={{
                  position: 'absolute',
                  top: h.y,
                  left: h.x,
                  transform: 'translate(-50%, -50%)',
                  width: h.size,
                  height: h.size,
                  background: `radial-gradient(circle, rgba(254, 214, 206, ${h.intensity * 0.7}) 0%, rgba(176, 203, 230, ${h.intensity * 0.3}) 50%, transparent 100%)`,
                }}
              />
            ))}

            <div style={{
              position: 'absolute', bottom: 10, right: 10,
              background: 'rgba(17, 30, 54, 0.85)', borderRadius: 8, padding: '4px 10px',
              fontSize: 10, color: '#a4b5d1', border: '1px solid rgba(164, 181, 209, 0.2)',
              display: 'flex', gap: 10,
            }}>
              <span>High Intensity (#fed6ce)</span>
              <span>Moderate (#b0cbe6)</span>
            </div>
          </div>
        </div>

        {/* Daily Active Student Players */}
        <div className="glass-dark" style={{ borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#b0cbe6', marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Daily Active Players (DAP)
          </div>
          <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, height: 140, paddingTop: 10 }}>
            {DAP_DATA.map((d) => (
              <div key={d.day} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', height: '100%' }}>
                <div style={{ flex: 1, display: 'flex', alignItems: 'flex-end', width: '100%' }}>
                  <div style={{
                    width: '100%', height: `${(d.players / MAX_DAP) * 100}%`,
                    background: 'linear-gradient(180deg, #fed6ce, #496894)',
                    borderRadius: '4px 4px 0 0', minHeight: 4,
                  }} />
                </div>
                <div style={{ fontSize: 9, color: '#a4b5d1', marginTop: 4 }}>{d.day}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Card Circulation & Scrapping */}
        <div className="glass-dark" style={{ borderRadius: 14, padding: 14 }}>
          <div style={{ fontSize: 12, fontWeight: 800, color: '#b0cbe6', marginBottom: 10, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
            Card Circulation & Scrapping Rates
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {CARD_ECONOMY.map((c) => (
              <div key={c.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: '#a4b5d1', marginBottom: 2 }}>
                  <span>{c.label}</span>
                  <span style={{ color: '#fed6ce' }}>{c.earned} awarded</span>
                </div>
                <div className="stat-bar-track" style={{ height: 5 }}>
                  <div className="stat-bar-fill" style={{ width: `${(c.earned / 450) * 100}%`, background: '#fed6ce' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
