import { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
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
  iconSize: [70, 70],
  iconAnchor: [35, 35],
});

const userLocationIcon = new L.DivIcon({
  className: 'user-location-marker',
  html: `
    <div class="user-dot-outer">
      <div class="user-dot-inner"></div>
    </div>
  `,
  iconSize: [24, 24],
  iconAnchor: [12, 12],
});

const landmarkIcon = new L.DivIcon({
  className: 'landmark-marker',
  html: `
    <svg width="20" height="26" viewBox="0 0 20 26" xmlns="http://www.w3.org/2000/svg">
      <rect
        x="1" y="1" width="18" height="24" rx="3"
        fill="#6a3fa0"
        stroke="#fffefc"
        stroke-width="1.5"
      />
      <rect x="4" y="4" width="12" height="18" rx="1.5" fill="#8b5fc7" opacity="0.5" />
      <circle cx="10" cy="13" r="3.2" fill="#f5c37a" />
    </svg>
  `,
  iconSize: [20, 26],
  iconAnchor: [10, 24],
  popupAnchor: [0, -22],
});

interface Landmark {
  name: string;
  position: [number, number];
}

const LANDMARKS: Landmark[] = [
  { name: "Great Hall", position: [-26.192177415373987, 28.030361941387124] },
  { name: "Humphrey Raikes", position: [-26.192095332747023, 28.03127963680826] },
  { name: "Wartenweiler Library", position: [-26.191243529310864, 28.03087176603622] },
  { name: "Wits School of the Arts", position: [-26.192037583558378, 28.032449581917486] },
  { name: "William Cullen Library", position: [-26.190829656466303, 28.029379817685918] },
  { name: "Amphitheatre", position: [-26.190136656782915, 28.029980890402594] },
  { name: "John Moffat Pond", position: [-26.190189594404178, 28.02955155274785] },
  { name: "TW Kambule Mathematical Sciences Building", position: [-26.19046871964564, 28.026841358802145] },
  { name: "Wits Science Stadium", position: [-26.19066603191282, 28.02523134259679] },
  { name: "Tower of Light", position: [-26.18978053034198, 28.02594511644781] },
  { name: "The Matrix", position: [-26.189616064701625, 28.030808592703018] },
  { name: "Chamber of Mines", position: [-26.191709498016966, 28.02699822101696] },
  { name: "South West Engineering", position: [-26.19202018489526, 28.02935054349668] },
  { name: "Flower Hall", position: [-26.191733973644435, 28.02620961472413] },
  { name: "Wits Sturrock Park", position: [-26.19319213569335, 28.021073663028996] },
  { name: "Origins Centre", position: [-26.192977185786265, 28.028291004158817] },
  { name: "Old Mutual Sport Hall", position: [-26.189627614752393, 28.029321916975654] },
  { name: "John Moffat", position: [-26.190151568368808, 28.029334082969147] },
];

export interface MapExplorerProps {
  onOpenTrivia?: (landmark: any) => void;
}

// Leaflet doesn't watch its container for resizes on its own.
// This forces a recalculation on mount, orientation change, and
// visualViewport resize (mobile browser chrome collapsing/expanding).
function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize();

    // Fire once shortly after mount, after layout has settled
    const t1 = setTimeout(invalidate, 100);
    const t2 = setTimeout(invalidate, 500);

    window.addEventListener('resize', invalidate);
    window.addEventListener('orientationchange', invalidate);
    window.visualViewport?.addEventListener('resize', invalidate);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      window.removeEventListener('resize', invalidate);
      window.removeEventListener('orientationchange', invalidate);
      window.visualViewport?.removeEventListener('resize', invalidate);
    };
  }, [map]);

  return null;
}

function UserLocationFocus({ position }: { position: [number, number] | null }) {
  const map = useMap();
  const [hasCentered, setHasCentered] = useState(false);

  useEffect(() => {
    if (position && !hasCentered) {
      map.flyTo(position, 18, { animate: true, duration: 1.5 });
      setHasCentered(true);
    }
  }, [position, hasCentered, map]);

  return null;
}

export default function MapExplorer({ onOpenTrivia }: MapExplorerProps) {
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

    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  return (
    <div
      style={{
        flex: 1,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: '#FAF7F2',
        overscrollBehavior: 'none',
      }}
    >
      <style>{`
        html, body {
          overscroll-behavior: none;
        }
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
        .user-dot-outer {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: rgba(211, 122, 50, 0.25);
          display: flex;
          align-items: center;
          justify-content: center;
          animation: user-dot-pulse 2s ease-in-out infinite;
        }
        .user-dot-inner {
          width: 14px;
          height: 14px;
          border-radius: 50%;
          background: #D37A32;
          border: 3px solid #ffffff;
          box-shadow: 0 1px 4px rgba(0,0,0,0.4);
        }
        @keyframes user-dot-pulse {
          0%, 100% { transform: scale(1); }
          50% { transform: scale(1.3); }
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
        /* Leaflet's own pane needs explicit touch-action so
           iOS doesn't treat drags as page scroll/rubber-banding */
        .leaflet-container {
          touch-action: pan-x pan-y;
        }
      `}</style>

      {locationError && (
        <div className="location-error-banner">{locationError}</div>
      )}

      <div
        style={{
          width: '100%',
          flex: 1,
          position: 'relative',
        }}
      >
        <MapContainer
          center={WITS_CENTER}
          zoom={DEFAULT_ZOOM}
          maxZoom={19}
          style={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0 }}
          zoomControl={true}
        >
          <MapResizeHandler />
          <UserLocationFocus position={userPosition} />
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

          {LANDMARKS.map((landmark) => (
            <Marker key={landmark.name} position={landmark.position} icon={landmarkIcon}>
              <Popup>{landmark.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}