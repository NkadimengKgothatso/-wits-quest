import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const WITS_CENTER: [number, number] = [-26.1888, 28.0247];
const DEFAULT_ZOOM = 18;

const witsLabelIcon = new L.DivIcon({
  className: 'wits-label-marker',
  html: `
    <div class="wits-w-badge">
      <span class="wits-w-letter">W</span>
    </div>
  `,
  iconSize: [0, 0],
  iconAnchor: [40, 40],
});

export default function MapExplorer() {
  return (
    <div style={{ height: '100vh', width: '100%' }}>
      <style>{`
        .adventure-tiles {
          filter: sepia(0.4) saturate(1.3) hue-rotate(-10deg) contrast(1.05);
        }

        .wits-w-badge {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 30%, #3a5580, #1d3156);
          border: 4px solid #fffefc;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow: 0 4px 14px rgba(0,0,0,0.5);
          animation: wits-pulse 2s ease-in-out infinite;
        }

        .wits-w-letter {
          font-family: Georgia, serif;
          font-weight: 900;
          font-size: 34px;
          color: #f9f7f4;
          text-shadow: 0 2px 4px rgba(0,0,0,0.4);
        }

        @keyframes wits-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow: 0 4px 14px rgba(255, 255, 255, 0.98);
          }
          50% {
            transform: scale(1.08);
            box-shadow: 0 4px 24px rgba(250, 246, 241, 0.93);
          }
        }
      `}</style>

      <MapContainer
        center={WITS_CENTER}
        zoom={DEFAULT_ZOOM}
        maxZoom={19}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
          className="adventure-tiles"
        />

        <Marker position={WITS_CENTER} icon={witsLabelIcon}>
          <Popup>
            <div style={{ textAlign: 'center', fontFamily: 'Georgia, serif' }}>
              <strong>Wits University</strong>
              <br />
              <em style={{ fontSize: 13 }}>Number 1 in Africa</em>
            </div>
          </Popup>
        </Marker>
      </MapContainer>
    </div>
  );
}