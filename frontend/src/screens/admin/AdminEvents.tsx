import { useState } from 'react';
import { MapContainer, TileLayer, Marker, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const WITS_CENTER: [number, number] = [-26.192885679106496, 28.030521047594373];
const DEFAULT_ZOOM = 18;

interface Landmark {
  name: string;
  position: [number, number];
}

const LANDMARKS: Landmark[] = [
  { name: 'Great Hall', position: [-26.192177415373987, 28.030361941387124] },
  { name: 'Humphrey Raikes', position: [-26.192095332747023, 28.03127963680826] },
  { name: 'Wartenweiler Library', position: [-26.191243529310864, 28.03087176603622] },
  { name: 'Wits School of the Arts', position: [-26.192037583558378, 28.032449581917486] },
  { name: 'William Cullen Library', position: [-26.190829656466303, 28.029379817685918] },
  { name: 'Amphitheatre', position: [-26.190136656782915, 28.029980890402594] },
  { name: 'John Moffat Pond', position: [-26.190189594404178, 28.02955155274785] },
  { name: 'TW Kambule Mathematical Sciences Building', position: [-26.19046871964564, 28.026841358802145] },
  { name: 'Wits Science Stadium', position: [-26.19066603191282, 28.02523134259679] },
  { name: 'Tower of Light', position: [-26.18978053034198, 28.02594511644781] },
  { name: 'The Matrix', position: [-26.189616064701625, 28.030808592703018] },
  { name: 'Chamber of Mines', position: [-26.191709498016966, 28.02699822101696] },
  { name: 'South West Engineering', position: [-26.19202018489526, 28.02935054349668] },
  { name: 'Flower Hall', position: [-26.191733973644435, 28.02620961472413] },
  { name: 'Wits Sturrock Park', position: [-26.19319213569335, 28.021073663028996] },
  { name: 'Origins Centre', position: [-26.192977185786265, 28.028291004158817] },
  { name: 'Old Mutual Sport Hall', position: [-26.189627614752393, 28.029321916975654] },
  { name: 'John Moffat', position: [-26.190151568368808, 28.029334082969147] },
];

const landmarkIcon = new L.DivIcon({
  className: 'admin-landmark-marker',
  html: `<div class="admin-landmark-pin"></div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 20],
});

const pendingEventIcon = new L.DivIcon({
  className: 'admin-pending-marker',
  html: `<div class="admin-pending-pin"></div>`,
  iconSize: [20, 20],
  iconAnchor: [10, 10],
});

function MapResizeHandler() {
  const map = useMap();
  useState(() => {
    setTimeout(() => map.invalidateSize(), 100);
  });
  return null;
}

function EventPlacementHandler({
  onPickLandmark,
  onPickEmpty,
}: {
  onPickLandmark: (landmark: Landmark) => void;
  onPickEmpty: (position: [number, number]) => void;
}) {
  useMap().on('click', (e) => {
    onPickEmpty([e.latlng.lat, e.latlng.lng]);
  });
  return null;
}

export interface AdminEventsProps {
  onSaveEvent?: (event: { name: string; position: [number, number] }) => void;
}

export default function AdminEvents({ onSaveEvent }: AdminEventsProps) {
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [pendingPosition, setPendingPosition] = useState<[number, number] | null>(null);
  const [eventName, setEventName] = useState('');
  const [savedMsg, setSavedMsg] = useState('');

  function handleLandmarkClick(landmark: Landmark) {
    setSelectedLandmark(landmark);
    setPendingPosition(null);
    setEventName(`${landmark.name} Challenge`);
  }

  function handleEmptyMapClick(position: [number, number]) {
    setSelectedLandmark(null);
    setPendingPosition(position);
    setEventName('');
  }

  function handleSaveEvent() {
    const position = selectedLandmark?.position ?? pendingPosition;
    if (!position || !eventName.trim()) return;

    onSaveEvent?.({ name: eventName.trim(), position });

    setSavedMsg('Event saved!');
    setTimeout(() => setSavedMsg(''), 2000);
  }

  function handleClosePanel() {
    setSelectedLandmark(null);
    setPendingPosition(null);
    setEventName('');
    setSavedMsg('');
  }

  const panelOpen = selectedLandmark !== null || pendingPosition !== null;
  const panelPosition = selectedLandmark?.position ?? pendingPosition;
  const panelTitle = selectedLandmark?.name ?? 'New Event Location';

  return (
    <div style={{ position: 'fixed', inset: 0, overflow: 'hidden', background: '#7a5c3e', padding: '90px 40px', boxSizing: 'border-box', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <style>{`
        .admin-landmark-pin {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          background: #4a3620;
          opacity: 0.24;
          filter:
            blur(2px)
            drop-shadow(0 0 10px rgba(74, 54, 32, 0.55));
          cursor: pointer;
          animation: admin-landmark-pulse 2.8s ease-in-out infinite;
        }
        @keyframes admin-landmark-pulse {
          0%, 100% {
            opacity: 0.18;
          }
          50% {
            opacity: 0.32;
          }
        }
        .admin-pending-pin {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #2e7d32;
          border: 3px solid #fffefc;
          box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.25), 0 2px 8px rgba(0,0,0,0.4);
        }
        .adventure-tiles {
          filter: sepia(0.4) saturate(1.3) hue-rotate(-10deg) contrast(1.05);
        }
        .scroll-wrapper {
          width: 100%;
          max-width: 1400px;
          height: 100%;
          max-height: 900px;
          display: flex;
          flex-direction: row;
          align-items: center;
        }
        .scroll-roller {
          height: 100%;
          width: 34px;
          flex-shrink: 0;
          border-radius: 17px;
          background: linear-gradient(90deg, #a9814f 0%, #8a6538 20%, #6b4a26 50%, #8a6538 80%, #a9814f 100%);
          box-shadow: 0 4px 10px rgba(0,0,0,0.4), inset 2px 0 3px rgba(255,255,255,0.25);
          position: relative;
          z-index: 2;
        }
        .scroll-roller::before,
        .scroll-roller::after {
          content: '';
          position: absolute;
          left: 0;
          width: 100%;
          height: 22px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #b8905c, #5a3f20);
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
        }
        .scroll-roller::before { top: -6px; }
        .scroll-roller::after { bottom: -6px; }
        .admin-map-frame {
          position: relative;
          height: calc(100% - 30px);
          flex: 1;
          min-width: 0;
          background: #f0e2c0;
          border-top: 6px solid #d9c290;
          border-bottom: 6px solid #d9c290;
          box-shadow:
            inset 0 0 30px rgba(90, 63, 32, 0.35),
            0 0 0 1px rgba(90, 63, 32, 0.2);
          overflow: hidden;
        }
        .admin-side-panel {
          position: fixed;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%) scale(${panelOpen ? '1' : '0.9'});
          opacity: ${panelOpen ? '1' : '0'};
          pointer-events: ${panelOpen ? 'auto' : 'none'};
          width: 360px;
          max-width: calc(100vw - 48px);
          background: #f5ecd7;
          border: 3px solid #4a3620;
          border-radius: 18px;
          box-shadow: 0 10px 30px rgba(0,0,0,0.5);
          padding: 22px;
          box-sizing: border-box;
          z-index: 1300;
          transition: opacity 0.25s ease, transform 0.25s ease;
          font-family: Georgia, serif;
          color: #4a3620;
        }
        .admin-panel-close {
          position: absolute;
          top: 12px;
          right: 14px;
          background: none;
          border: none;
          font-size: 18px;
          cursor: pointer;
          color: #4a3620;
        }
      `}</style>

      <div className="scroll-wrapper">
        <div className="scroll-roller" />
        <div className="admin-map-frame">
          <MapContainer
          center={WITS_CENTER}
          zoom={DEFAULT_ZOOM}
          maxZoom={19}
          style={{ width: '100%', height: '100%' }}
        >
          <MapResizeHandler />
          <EventPlacementHandler
            onPickLandmark={handleLandmarkClick}
            onPickEmpty={handleEmptyMapClick}
          />

          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            maxZoom={19}
            className="adventure-tiles"
          />

          {LANDMARKS.map((landmark) => (
            <Marker
              key={landmark.name}
              position={landmark.position}
              icon={landmarkIcon}
              eventHandlers={{
                click: (e) => {
                  L.DomEvent.stopPropagation(e);
                  handleLandmarkClick(landmark);
                },
              }}
            />
          ))}

          {pendingPosition && (
            <Marker position={pendingPosition} icon={pendingEventIcon} />
          )}
        </MapContainer>
        </div>
        <div className="scroll-roller" />
      </div>

      {/* Side panel - appears on the right when a landmark or empty spot is clicked */}
      <div className="admin-side-panel">
        <button className="admin-panel-close" onClick={handleClosePanel}>✕</button>

        <h2 style={{ margin: '0 0 4px', fontSize: 22, fontWeight: 700 }}>{panelTitle}</h2>

        {panelPosition && (
          <p style={{ fontSize: 12, color: '#7a6644', margin: '0 0 16px' }}>
            {panelPosition[0].toFixed(6)}, {panelPosition[1].toFixed(6)}
          </p>
        )}

        <label style={{ fontSize: 13, fontWeight: 700, display: 'block', marginBottom: 6 }}>
          Event Name
        </label>
        <input
          style={{
            width: '100%',
            padding: '10px 14px',
            borderRadius: 10,
            border: '2px solid #caa25c',
            background: '#fffefc',
            color: '#4a3620',
            outline: 'none',
            fontSize: 14,
            boxSizing: 'border-box',
            marginBottom: 16,
          }}
          value={eventName}
          onChange={(e) => setEventName(e.target.value)}
          placeholder="e.g. Great Hall History Challenge"
        />

        {savedMsg && (
          <div style={{ color: '#2e7d32', fontWeight: 700, marginBottom: 12 }}>✓ {savedMsg}</div>
        )}

        <button
          onClick={handleSaveEvent}
          disabled={!eventName.trim()}
          style={{
            width: '100%',
            padding: '12px',
            borderRadius: 10,
            background: eventName.trim() ? '#4a3620' : '#a8987a',
            color: '#f5ecd7',
            fontWeight: 700,
            border: 'none',
            cursor: eventName.trim() ? 'pointer' : 'not-allowed',
            fontSize: 14,
          }}
        >
          {selectedLandmark ? 'Create Event at This Landmark' : 'Create Event Here'}
        </button>
      </div>
    </div>
  );
}