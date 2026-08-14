import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const WITS_CENTER: [number, number] = [-26.192885679106496, 28.030521047594373];
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

const userLocationIcon = new L.DivIcon({
  className: 'user-location-marker',
  html: `
    <div class="pin-wrapper">
      <svg width="32" height="42" viewBox="0 0 32 42" xmlns="http://www.w3.org/2000/svg">
        <path
          d="M16 0C7.163 0 0 7.163 0 16c0 11 16 26 16 26s16-15 16-26c0-8.837-7.163-16-16-16z"
          fill="#4285f4"
          stroke="#ffffff"
          stroke-width="1.5"
        />
        <circle cx="16" cy="16" r="6" fill="#ffffff" />
      </svg>
    </div>
  `,
  iconSize: [32, 42],
  iconAnchor: [16, 42],
  popupAnchor: [0, -42],
});

export default function MapExplorer() {
  const [userPosition, setUserPosition] = useState<[number, number] | null>(null);
  const [locationError, setLocationError] = useState<string | null>(null);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setLocationError('Geolocation is not supported by this browser.');
      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setUserPosition([position.coords.latitude, position.coords.longitude]);
        setLocationError(null);
      },
      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError('Location permission denied. Enable it in your browser settings to see your position on the map.');
        } else if (error.code === error.POSITION_UNAVAILABLE) {
          setLocationError('Location unavailable right now.');
        } else if (error.code === error.TIMEOUT) {
          setLocationError('Location request timed out.');
        } else {
          setLocationError('Unable to get your location.');
        }
      },
      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    // Stop watching when the component unmounts, so we don't leak
    // an active GPS watch after the user navigates away from this screen.
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div
      style={{
        height: '100vh',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: '#0a1128',
        position: 'relative',
      }}
    >
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
          .pin-wrapper {
  position: relative;
}
.pin-wrapper::after {
  content: '';
  position: absolute;
  bottom: -4px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 6px;
  border-radius: 50%;
  background: rgba(66, 133, 244, 0.4);
  animation: pin-ring 1.6s ease-in-out infinite;
}
@keyframes pin-ring {
  0%, 100% { transform: translateX(-50%) scale(1); opacity: 0.6; }
  50% { transform: translateX(-50%) scale(1.6); opacity: 0.2; }
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
       
        .location-error-banner {
          position: absolute;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000;
          background: #fdecea;
          color: #b3261e;
          border: 1px solid #f2b8b5;
          border-radius: 8px;
          padding: 8px 16px;
          font-family: system-ui, sans-serif;
          font-size: 13px;
          max-width: 90%;
          text-align: center;
          box-shadow: 0 2px 8px rgba(0,0,0,0.2);
        }
      `}</style>

      {locationError && (
        <div className="location-error-banner">{locationError}</div>
      )}

      {/* Rounded-rectangle clipped map window - no border, no glow */}
      <div
        style={{
          width: 'min(92vw, 1100px)',
          height: 'min(85vh, 800px)',
          borderRadius: 32,
          overflow: 'hidden',
        }}
      >
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

          {userPosition && (
            <Marker position={userPosition} icon={userLocationIcon}>
              <Popup>You are here</Popup>
            </Marker>
          )}
        </MapContainer>
      </div>
    </div>
  );
}