import { useState } from 'react';

const TRAILS = [
  {
    id: 1,
    name: 'Wits Science & Innovation Trail',
    progress: 3,
    total: 5,
    reward: 'Quantum Scholar Card',
    rewardRarity: 'Legendary',
    locations: [
      { name: 'Science Stadium', done: true, distance: 210 },
      { name: 'Engineering Block', done: true, distance: 180 },
      { name: 'Medical School', done: true, distance: 95 },
      { name: 'Maths Building', done: false, distance: 45, isNext: true },
      { name: 'Wits Origins Centre', done: false, distance: 320 },
    ],
  },
  {
    id: 2,
    name: 'Wits Historical Landmarks',
    progress: 1,
    total: 5,
    reward: 'Wits Founder Card',
    rewardRarity: 'Epic',
    locations: [
      { name: 'Great Hall', done: true, distance: 12 },
      { name: 'Senate House', done: false, distance: 87, isNext: true },
      { name: 'Chamber of Mines', done: false, distance: 150 },
      { name: 'Jubilee Hall', done: false, distance: 200 },
      { name: 'Cullen Library', done: false, distance: 134 },
    ],
  },
  {
    id: 3,
    name: 'Student Life Experience Trail',
    progress: 0,
    total: 4,
    reward: 'Campus Spirit Card',
    rewardRarity: 'Rare',
    locations: [
      { name: 'Student Village', done: false, distance: 300, isNext: true },
      { name: 'Solomon Mahlangu House', done: false, distance: 18 },
      { name: 'Wits Theatre', done: false, distance: 220 },
      { name: 'Matrix Student Mall', done: false, distance: 90 },
    ],
  },
];

export default function QuestTrails() {
  const [selectedTrail, setSelectedTrail] = useState(TRAILS[0]);

  return (
    <div style={{
      minHeight: '100vh',
      background: 'radial-gradient(ellipse at 50% 10%, #253d6a 0%, #1d3156 50%, #0f1a2e 100%)',
      paddingTop: 16, paddingBottom: 80,
    }}>
      <div style={{ padding: '14px 16px 0', maxWidth: 600, margin: '0 auto' }}>
        <h2 style={{ fontSize: 20, fontWeight: 900, color: 'white', margin: '0 0 4px' }}>Quest Trails</h2>
        <p style={{ fontSize: 12, color: '#a4b5d1', margin: '0 0 16px' }}>Complete sequential campus landmark stops to unlock legendary rewards</p>
      </div>

      <div style={{ padding: '0 16px', maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 14 }}>
        {TRAILS.map((trail) => {
          const isSelected = selectedTrail.id === trail.id;
          const percent = Math.round((trail.progress / trail.total) * 100);
          return (
            <div
              key={trail.id}
              className="glass-dark"
              style={{
                borderRadius: 16, padding: 16,
                border: `1.5px solid ${isSelected ? '#fed6ce' : 'rgba(164,181,209,0.2)'}`,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
              onClick={() => setSelectedTrail(trail)}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
                <div>
                  <div style={{ fontSize: 15, fontWeight: 800, color: 'white', marginBottom: 2 }}>{trail.name}</div>
                  <div style={{ fontSize: 11, color: '#a4b5d1' }}>Reward: {trail.reward} ({trail.rewardRarity})</div>
                </div>
                <div style={{ background: 'rgba(254, 214, 206, 0.15)', border: '1px solid rgba(254, 214, 206, 0.3)', borderRadius: 8, padding: '4px 10px', fontSize: 11, fontWeight: 800, color: '#fed6ce' }}>
                  {trail.progress}/{trail.total} Completed
                </div>
              </div>

              {/* Progress bar */}
              <div className="stat-bar-track" style={{ height: 6, marginBottom: 14 }}>
                <div className="stat-bar-fill" style={{ width: `${percent}%`, background: 'linear-gradient(90deg, #b0cbe6, #fed6ce)' }} />
              </div>

              {/* Sequential Stops */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {trail.locations.map((loc, idx) => (
                  <div key={idx} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '8px 12px', borderRadius: 10,
                    background: loc.done ? 'rgba(176,203,230,0.12)' : loc.isNext ? 'rgba(254, 214, 206, 0.15)' : 'rgba(29,49,86,0.4)',
                    border: `1px solid ${loc.done ? 'rgba(176,203,230,0.3)' : loc.isNext ? 'rgba(254, 214, 206, 0.4)' : 'rgba(164,181,209,0.1)'}`,
                  }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 22, height: 22, borderRadius: '50%',
                        background: loc.done ? '#b0cbe6' : loc.isNext ? '#fed6ce' : '#496894',
                        color: '#1d3156', fontWeight: 800, fontSize: 10,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        {loc.done ? '✓' : idx + 1}
                      </div>
                      <span style={{ fontSize: 12, fontWeight: 700, color: loc.done ? '#b0cbe6' : loc.isNext ? '#fed6ce' : 'white' }}>
                        {loc.name}
                      </span>
                    </div>
                    <span style={{ fontSize: 10, color: '#a4b5d1' }}>{loc.distance}m</span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
