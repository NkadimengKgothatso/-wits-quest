import { useEffect, useState } from 'react';
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Circle,
  useMap,
} from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const WITS_CENTER: [number, number] = [
  -26.192885679106496,
  28.030521047594373,
];

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
    <div class="user-location-pin">
      <div class="user-location-glow"></div>
      <div class="user-location-head">
        <div class="user-location-dot"></div>
      </div>
      <div class="user-location-point"></div>
    </div>
  `,
  iconSize: [42, 50],
  iconAnchor: [21, 47],
  popupAnchor: [0, -42],
});

interface Landmark {
  name: string;
  position: [number, number];
}

const LANDMARKS: Landmark[] = [
  {
    name: 'Great Hall',
    position: [-26.192177415373987, 28.030361941387124],
  },
  {
    name: 'Humphrey Raikes',
    position: [-26.192095332747023, 28.03127963680826],
  },
  {
    name: 'Wartenweiler Library',
    position: [-26.191243529310864, 28.03087176603622],
  },
  {
    name: 'Wits School of the Arts',
    position: [-26.192037583558378, 28.032449581917486],
  },
  {
    name: 'William Cullen Library',
    position: [-26.190829656466303, 28.029379817685918],
  },
  {
    name: 'Amphitheatre',
    position: [-26.190136656782915, 28.029980890402594],
  },
  {
    name: 'John Moffat Pond',
    position: [-26.190189594404178, 28.02955155274785],
  },
  {
    name: 'TW Kambule Mathematical Sciences Building',
    position: [-26.19046871964564, 28.026841358802145],
  },
  {
    name: 'Wits Science Stadium',
    position: [-26.19066603191282, 28.02523134259679],
  },
  {
    name: 'Tower of Light',
    position: [-26.18978053034198, 28.02594511644781],
  },
  {
    name: 'The Matrix',
    position: [-26.189616064701625, 28.030808592703018],
  },
  {
    name: 'Chamber of Mines',
    position: [-26.191709498016966, 28.02699822101696],
  },
  {
    name: 'South West Engineering',
    position: [-26.19202018489526, 28.02935054349668],
  },
  {
    name: 'Flower Hall',
    position: [-26.191733973644435, 28.02620961472413],
  },
  {
    name: 'Wits Sturrock Park',
    position: [-26.19319213569335, 28.021073663028996],
  },
  {
    name: 'Origins Centre',
    position: [-26.192977185786265, 28.028291004158817],
  },
  {
    name: 'Old Mutual Sport Hall',
    position: [-26.189627614752393, 28.029321916975654],
  },
  {
    name: 'John Moffat',
    position: [-26.190151568368808, 28.029334082969147],
  },
];

export interface MapExplorerProps {
  onOpenTrivia?: (landmark: any) => void;
}

// Haversine formula.
// Returns the distance between two coordinates in metres.
function haversineDistance(
  userPosition: [number, number],
  landmarkPosition: [number, number]
): number {
  const R = 6371000;

  const lat1 = (userPosition[0] * Math.PI) / 180;
  const lat2 = (landmarkPosition[0] * Math.PI) / 180;

  const deltaLat =
    ((landmarkPosition[0] - userPosition[0]) * Math.PI) / 180;

  const deltaLon =
    ((landmarkPosition[1] - userPosition[1]) * Math.PI) / 180;

  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(lat1) *
      Math.cos(lat2) *
      Math.sin(deltaLon / 2) ** 2;

  const c = 2 * Math.asin(Math.sqrt(a));

  return R * c;
}

// Forces Leaflet to recalculate its size when the container changes.
function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const invalidate = () => map.invalidateSize();

    const t1 = setTimeout(invalidate, 100);
    const t2 = setTimeout(invalidate, 500);

    window.addEventListener('resize', invalidate);
    window.addEventListener('orientationchange', invalidate);

    window.visualViewport?.addEventListener(
      'resize',
      invalidate
    );

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);

      window.removeEventListener('resize', invalidate);
      window.removeEventListener(
        'orientationchange',
        invalidate
      );

      window.visualViewport?.removeEventListener(
        'resize',
        invalidate
      );
    };
  }, [map]);

  return null;
}

function UserLocationFocus({
  position,
}: {
  position: [number, number] | null;
}) {
  const map = useMap();
  const [hasCentered, setHasCentered] = useState(false);

  useEffect(() => {
    if (position && !hasCentered) {
      map.flyTo(position, 18, {
        animate: true,
        duration: 1.5,
      });

      setHasCentered(true);
    }
  }, [position, hasCentered, map]);

  return null;
}

// Compass displayed in the top-right corner of the map.
function Compass() {
  return (
    <div className="map-compass">
      <div className="compass-north">N</div>
      <div className="compass-east">E</div>
      <div className="compass-south">S</div>
      <div className="compass-west">W</div>

      <div className="compass-needle">
        <div className="compass-red"></div>
        <div className="compass-blue"></div>
      </div>

      <div className="compass-center"></div>
    </div>
  );
}

export default function MapExplorer({
  onOpenTrivia,
}: MapExplorerProps) {
  const [userPosition, setUserPosition] =
    useState<[number, number] | null>(null);

  const [locationError, setLocationError] =
    useState<string | null>(null);

  // Keeps track of landmarks the player has reached.
  const [discoveredLandmarks, setDiscoveredLandmarks] =
    useState<string[]>([]);

  useEffect(() => {
    if (!('geolocation' in navigator)) {
      setLocationError(
        'Geolocation is not supported by this browser.'
      );

      return;
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        const currentPosition: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];

        setUserPosition(currentPosition);
        setLocationError(null);

        // Check whether the player has reached any landmarks.
        LANDMARKS.forEach((landmark) => {
          const distance = haversineDistance(
            currentPosition,
            landmark.position
          );

          if (distance <= 25) {
            setDiscoveredLandmarks((previous) => {
              if (previous.includes(landmark.name)) {
                return previous;
              }

              return [
                ...previous,
                landmark.name,
              ];
            });
          }
        });
      },

      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(
            'Location permission denied. Enable it in your browser settings to see your position on the map.'
          );
        } else if (
          error.code === error.POSITION_UNAVAILABLE
        ) {
          setLocationError(
            'Location unavailable right now.'
          );
        } else if (error.code === error.TIMEOUT) {
          setLocationError(
            'Location request timed out.'
          );
        } else {
          setLocationError(
            'Unable to get your location.'
          );
        }
      },

      {
        enableHighAccuracy: true,
        maximumAge: 5000,
        timeout: 10000,
      }
    );

    return () =>
      navigator.geolocation.clearWatch(watchId);
  }, []);

  const nearbyLandmarks = userPosition
    ? LANDMARKS.filter((landmark) => {
        const distance = haversineDistance(
          userPosition,
          landmark.position
        );

        return distance <= 25;
      }).length
    : 0;

  return (
    <div className="map-page">

      <style>{`
        html,
        body {
          overscroll-behavior: none;
        }

        .map-page {
          min-height: 100%;
          width: 100%;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;
          position: relative;
          overflow-x: hidden;
          overflow-y: auto;
          background:
            radial-gradient(
              circle at 50% 5%,
              rgba(73, 104, 148, 0.22),
              transparent 38%
            ),
            radial-gradient(
              circle at 10% 70%,
              rgba(106, 63, 160, 0.08),
              transparent 30%
            ),
            #FAF7F2;
          padding: 8px 18px 28px;
          overscroll-behavior: none;
        }

        /* =========================================
           FLOATING ADVENTURE BACKGROUND
           ========================================= */

        .adventure-background {
          position: absolute;
          inset: 0;
          pointer-events: none;
          overflow: hidden;
          z-index: 0;
        }

        .floating-sparkle {
          position: absolute;
          font-family: Georgia, serif;
          color: #496894;
          opacity: 0.35;
          animation:
            sparkle-float 6s ease-in-out infinite;
        }

        .sparkle-1 {
          top: 13%;
          left: 8%;
          font-size: 20px;
          animation-delay: 0s;
        }

        .sparkle-2 {
          top: 29%;
          right: 7%;
          font-size: 15px;
          animation-delay: 1.5s;
        }

        .sparkle-3 {
          top: 61%;
          left: 5%;
          font-size: 13px;
          animation-delay: 3s;
        }

        .sparkle-4 {
          bottom: 18%;
          right: 9%;
          font-size: 22px;
          animation-delay: 4s;
        }

        .sparkle-5 {
          bottom: 7%;
          left: 18%;
          font-size: 12px;
          animation-delay: 2s;
        }

        .sparkle-6 {
          top: 43%;
          right: 17%;
          font-size: 11px;
          animation-delay: 4.5s;
        }

        @keyframes sparkle-float {
          0%, 100% {
            transform:
              translateY(0)
              rotate(0deg);
            opacity: 0.25;
          }

          50% {
            transform:
              translateY(-14px)
              rotate(12deg);
            opacity: 0.65;
          }
        }

        .discovery-orb {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #D37A32;
          box-shadow:
            0 0 8px rgba(211, 122, 50, 0.5);
          animation:
            orb-float 5s ease-in-out infinite;
        }

        .orb-1 {
          top: 23%;
          left: 15%;
          animation-delay: 0s;
        }

        .orb-2 {
          top: 52%;
          right: 12%;
          animation-delay: 2s;
        }

        .orb-3 {
          bottom: 15%;
          left: 10%;
          animation-delay: 3.5s;
        }

        .orb-4 {
          top: 74%;
          right: 20%;
          animation-delay: 1s;
        }

        @keyframes orb-float {
          0%, 100% {
            transform: translateY(0) scale(1);
            opacity: 0.25;
          }

          50% {
            transform: translateY(-18px) scale(1.35);
            opacity: 0.7;
          }
        }

        .adventure-badge {
          position: absolute;
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 6px 10px;
          border-radius: 999px;
          background: rgba(255, 254, 252, 0.7);
          border: 1px solid rgba(73, 104, 148, 0.16);
          color: #496894;
          font-family: system-ui, sans-serif;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.7px;
          text-transform: uppercase;
          box-shadow:
            0 4px 14px rgba(29, 49, 86, 0.06);
          animation:
            badge-float 7s ease-in-out infinite;
        }

        .adventure-badge::before {
          content: "✦";
          color: #D37A32;
          font-size: 12px;
        }

        .badge-1 {
          top: 18%;
          right: 4%;
          animation-delay: 1s;
        }

        .badge-2 {
          bottom: 12%;
          right: 5%;
          animation-delay: 3.5s;
        }

        @keyframes badge-float {
          0%, 100% {
            transform: translateY(0);
          }

          50% {
            transform: translateY(-9px);
          }
        }

        .route-dots {
          position: absolute;
          left: 3%;
          top: 35%;
          display: flex;
          flex-direction: column;
          gap: 9px;
          opacity: 0.3;
        }

        .route-dots span {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: #1d3156;
        }

        /* =========================================
           CONTENT
           ========================================= */

        .map-content {
          position: relative;
          z-index: 2;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .map-header {
          width: min(100%, 900px);
          margin-bottom: 10px;
          text-align: center;
        }

        .map-title {
          margin: 0;
          font-family: Georgia, serif;
          font-size: clamp(26px, 5vw, 38px);
          color: #1d3156;
          line-height: 1.1;
        }

        .map-subtitle {
          margin: 7px 0 0;
          font-family: system-ui, sans-serif;
          font-size: 14px;
          color: #496894;
        }

        .map-card {
          width: min(100%, 900px);
          background: #fffefc;
          border-radius: 22px;
          padding: 10px;
          box-sizing: border-box;
          box-shadow:
            0 12px 30px rgba(29, 49, 86, 0.16),
            0 2px 8px rgba(29, 49, 86, 0.08);
          border: 1px solid rgba(73, 104, 148, 0.18);
        }

        .map-frame {
          width: 100%;
          height: clamp(380px, 58vh, 620px);
          position: relative;
          overflow: hidden;
          border-radius: 16px;
          border: 2px solid #1d3156;
          box-shadow:
            inset 0 0 0 1px rgba(255,255,255,0.4);
        }

        .map-info-bar {
          width: min(100%, 900px);
          box-sizing: border-box;
          display: flex;
          gap: 12px;
          margin-top: 14px;
        }

        .map-info-card {
          flex: 1;
          background: #fffefc;
          border-radius: 14px;
          padding: 12px 15px;
          border: 1px solid rgba(73, 104, 148, 0.18);
          box-shadow:
            0 4px 12px rgba(29, 49, 86, 0.08);
        }

        .map-info-label {
          margin: 0 0 3px;
          font-family: system-ui, sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: #496894;
        }

        .map-info-value {
          margin: 0;
          font-family: Georgia, serif;
          font-size: 17px;
          font-weight: 700;
          color: #1d3156;
        }

        .location-error-banner {
          position: fixed;
          top: 16px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 2000;
          background: #fdecea;
          color: #b3261e;
          border: 1px solid #f2b8b5;
          border-radius: 8px;
          padding: 8px 16px;
          font-family: system-ui, sans-serif;
          font-size: 13px;
          max-width: 90%;
          text-align: center;
          box-shadow:
            0 2px 8px rgba(0,0,0,0.2);
        }

        .adventure-tiles {
          filter:
            sepia(0.4)
            saturate(1.3)
            hue-rotate(-10deg)
            contrast(1.05);
        }

        /* =========================================
           WITS MAP BADGE
           ========================================= */

        .wits-w-badge {
          width: 70px;
          height: 70px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle at 35% 30%,
              #3a5580,
              #1d3156
            );
          border: 4px solid #fffefc;
          display: flex;
          align-items: center;
          justify-content: center;
          box-shadow:
            0 4px 14px rgba(0,0,0,0.5);
          animation:
            wits-pulse 2s ease-in-out infinite;
        }

        .wits-w-letter {
          font-family: Georgia, serif;
          font-weight: 900;
          font-size: 34px;
          color: #f9f7f4;
          text-shadow:
            0 2px 4px rgba(0,0,0,0.4);
        }

        @keyframes wits-pulse {
          0%, 100% {
            transform: scale(1);
            box-shadow:
              0 4px 14px rgba(255, 255, 255, 0.98);
          }

          50% {
            transform: scale(1.08);
            box-shadow:
              0 4px 24px rgba(250, 246, 241, 0.93);
          }
        }

        /* =========================================
           GLOWING USER LOCATION PIN
           ========================================= */

        .user-location-pin {
          position: relative;
          width: 42px;
          height: 50px;
        }

        .user-location-glow {
          position: absolute;
          width: 34px;
          height: 34px;
          top: 1px;
          left: 4px;
          border-radius: 50%;
          background: rgba(211, 122, 50, 0.35);
          filter: blur(7px);
          animation: location-glow 2s ease-in-out infinite;
        }

        .user-location-head {
          position: absolute;
          top: 2px;
          left: 8px;
          width: 26px;
          height: 26px;
          border-radius: 50% 50% 50% 0;
          background: #D37A32;
          border: 3px solid #ffffff;
          box-shadow:
            0 2px 8px rgba(0,0,0,0.35);
          transform: rotate(-45deg);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .user-location-dot {
          width: 9px;
          height: 9px;
          border-radius: 50%;
          background: #fffefc;
          transform: rotate(45deg);
        }

        .user-location-point {
          position: absolute;
          display: none;
        }

        @keyframes location-glow {
          0%, 100% {
            transform: scale(0.9);
            opacity: 0.55;
          }

          50% {
            transform: scale(1.25);
            opacity: 0.9;
          }
        }

        /* =========================================
           LANDMARK DISCOVERY CIRCLES
           ========================================= */

        .landmark-circle {
          stroke: #ffffff;
          stroke-width: 3;
          fill: #6a3fa0;
          fill-opacity: 0.85;
          filter:
            drop-shadow(0 0 4px rgba(106, 63, 160, 0.7));
          animation:
            landmark-pulse 2.4s ease-in-out infinite;
        }

        .landmark-circle-nearby {
          stroke: #D37A32;
          stroke-width: 4;
          fill: #D37A32;
          fill-opacity: 0.9;
          filter:
            drop-shadow(0 0 7px rgba(211, 122, 50, 0.9));
          animation:
            landmark-nearby-pulse 1.2s ease-in-out infinite;
        }

        .landmark-circle-discovered {
          stroke: #ffffff;
          stroke-width: 3;
          fill: #496894;
          fill-opacity: 0.9;
          filter:
            drop-shadow(0 0 5px rgba(73, 104, 148, 0.8));
        }

        @keyframes landmark-pulse {
          0%, 100% {
            stroke-width: 3;
            fill-opacity: 0.78;
          }

          50% {
            stroke-width: 4;
            fill-opacity: 1;
          }
        }

        @keyframes landmark-nearby-pulse {
          0%, 100% {
            transform: scale(1);
          }

          50% {
            transform: scale(1.25);
          }
        }

        /* =========================================
           COMPASS
           ========================================= */

        .map-compass {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 58px;
          height: 58px;
          z-index: 1000;
          border-radius: 50%;
          background: rgba(255, 254, 252, 0.94);
          border: 2px solid #1d3156;
          box-shadow:
            0 3px 12px rgba(29, 49, 86, 0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, sans-serif;
          font-weight: 800;
          font-size: 10px;
        }

        .compass-north,
        .compass-east,
        .compass-south,
        .compass-west {
          position: absolute;
          color: #1d3156;
        }

        .compass-north {
          top: 3px;
          left: 50%;
          transform: translateX(-50%);
          color: #c94b4b;
        }

        .compass-east {
          right: 5px;
          top: 50%;
          transform: translateY(-50%);
        }

        .compass-south {
          bottom: 3px;
          left: 50%;
          transform: translateX(-50%);
        }

        .compass-west {
          left: 5px;
          top: 50%;
          transform: translateY(-50%);
        }

        .compass-needle {
          width: 24px;
          height: 24px;
          position: relative;
          transform: rotate(45deg);
        }

        .compass-red,
        .compass-blue {
          position: absolute;
          left: 50%;
          width: 4px;
          height: 12px;
          transform: translateX(-50%);
        }

        .compass-red {
          top: 0;
          background: #c94b4b;
          clip-path: polygon(
            50% 0,
            100% 100%,
            50% 75%,
            0 100%
          );
        }

        .compass-blue {
          bottom: 0;
          background: #496894;
          clip-path: polygon(
            50% 100%,
            100% 0,
            50% 25%,
            0 0
          );
        }

        .compass-center {
          position: absolute;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background: #1d3156;
          border: 2px solid #fffefc;
        }

        /* =========================================
           TRIVIA BUTTON
           ========================================= */

        .trivia-button {
          margin-top: 10px;
          padding: 8px 14px;
          border: none;
          border-radius: 6px;
          background: #1d3156;
          color: white;
          font-weight: 600;
          cursor: pointer;
        }

        .trivia-button:hover {
          background: #3a5580;
        }

        .leaflet-container {
          width: 100%;
          height: 100%;
          touch-action: pan-x pan-y;
        }

        @media (max-width: 600px) {
          .map-page {
            padding: 6px 12px 22px;
          }

          .map-frame {
            height: 52vh;
            min-height: 330px;
          }

          .map-card {
            padding: 7px;
            border-radius: 17px;
          }

          .map-frame {
            border-radius: 13px;
          }

          .map-info-bar {
            flex-direction: column;
          }

          .map-compass {
            top: 10px;
            right: 10px;
            width: 52px;
            height: 52px;
          }

          .adventure-badge {
            display: none;
          }

          .floating-sparkle {
            opacity: 0.2;
          }
        }
      `}</style>

      {/* =========================================
          FLOATING ADVENTURE BACKGROUND
          ========================================= */}

      <div className="adventure-background">

        <div className="floating-sparkle sparkle-1">
          ✦
        </div>

        <div className="floating-sparkle sparkle-2">
          ✧
        </div>

        <div className="floating-sparkle sparkle-3">
          ✦
        </div>

        <div className="floating-sparkle sparkle-4">
          ✧
        </div>

        <div className="floating-sparkle sparkle-5">
          ✦
        </div>

        <div className="floating-sparkle sparkle-6">
          ✧
        </div>

        <div className="discovery-orb orb-1"></div>
        <div className="discovery-orb orb-2"></div>
        <div className="discovery-orb orb-3"></div>
        <div className="discovery-orb orb-4"></div>

        <div className="adventure-badge badge-1">
          Explore Wits
        </div>

        <div className="adventure-badge badge-2">
          Discover. Learn. Play.
        </div>

        <div className="route-dots">
          <span></span>
          <span></span>
          <span></span>
          <span></span>
          <span></span>
        </div>

      </div>

      {locationError && (
        <div className="location-error-banner">
          {locationError}
        </div>
      )}

      <div className="map-content">

        <header className="map-header">
          <h1 className="map-title">
            Explore Campus
          </h1>

          <p className="map-subtitle">
            Discover landmarks and unlock trivia as you
            explore Wits.
          </p>
        </header>

        <div className="map-card">
          <div className="map-frame">

            <Compass />

            <MapContainer
              center={WITS_CENTER}
              zoom={DEFAULT_ZOOM}
              maxZoom={19}
              zoomControl={true}
            >
              <MapResizeHandler />

              <UserLocationFocus
                position={userPosition}
              />

              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                maxZoom={19}
                className="adventure-tiles"
              />

              {/* Wits centre marker */}

              <Marker
                position={WITS_CENTER}
                icon={witsLabelIcon}
              >
                <Popup>
                  <div
                    style={{
                      textAlign: 'center',
                      fontFamily: 'Georgia, serif',
                    }}
                  >
                    <strong>
                      Wits University
                    </strong>

                    <br />

                    <em style={{ fontSize: 13 }}>
                      Number 1 in Africa
                    </em>
                  </div>
                </Popup>
              </Marker>

              {/* Player location */}

              {userPosition && (
                <Marker
                  position={userPosition}
                  icon={userLocationIcon}
                >
                  <Popup>
                    <div
                      style={{
                        textAlign: 'center',
                        fontFamily:
                          'system-ui, sans-serif',
                      }}
                    >
                      <strong>
                        You are here
                      </strong>

                      <p
                        style={{
                          margin: '5px 0 0',
                          fontSize: 12,
                        }}
                      >
                        Your current GPS position
                      </p>
                    </div>
                  </Popup>
                </Marker>
              )}

              {/* =====================================
                  LANDMARK DISCOVERY CIRCLES
                  ===================================== */}

              {LANDMARKS.map((landmark) => {
                const distance = userPosition
                  ? haversineDistance(
                      userPosition,
                      landmark.position
                    )
                  : null;

                const isNearby =
                  distance !== null &&
                  distance <= 25;

                const isDiscovered =
                  discoveredLandmarks.includes(
                    landmark.name
                  );

                const status =
                  isNearby
                    ? 'IN_RADIUS'
                    : 'OUT_OF_RANGE';

                return (
                  <Circle
                    key={landmark.name}
                    center={landmark.position}
                    radius={isNearby ? 9 : 7}
                    className={
                      isDiscovered
                        ? 'landmark-circle-discovered'
                        : isNearby
                        ? 'landmark-circle-nearby'
                        : 'landmark-circle'
                    }
                    pathOptions={{
                      color: isDiscovered
                        ? '#ffffff'
                        : isNearby
                        ? '#D37A32'
                        : '#ffffff',

                      fillColor: isDiscovered
                        ? '#496894'
                        : isNearby
                        ? '#D37A32'
                        : '#6a3fa0',

                      fillOpacity: isDiscovered
                        ? 0.9
                        : isNearby
                        ? 0.9
                        : 0.85,

                      weight: isNearby ? 4 : 3,
                    }}
                  >
                    <Popup>
                      <div
                        style={{
                          textAlign: 'center',
                          fontFamily:
                            'system-ui, sans-serif',
                        }}
                      >
                        <strong>
                          {landmark.name}
                        </strong>

                        {distance === null ? (
                          <p
                            style={{
                              margin:
                                '8px 0 0',
                            }}
                          >
                            Waiting for your
                            location...
                          </p>
                        ) : status === 'IN_RADIUS' ? (
                          <>
                            <p
                              style={{
                                margin:
                                  '8px 0',
                                fontWeight: 600,
                                color: '#D37A32',
                              }}
                            >
                              ✦ DISCOVERY ZONE ✦
                            </p>

                            <p
                              style={{
                                margin:
                                  '4px 0',
                                fontSize: 12,
                              }}
                            >
                              You found a landmark!
                            </p>

                            <button
                              className="trivia-button"
                              onClick={() =>
                                onOpenTrivia?.(
                                  landmark
                                )
                              }
                            >
                              Start Trivia Challenge
                            </button>
                          </>
                        ) : (
                          <p
                            style={{
                              margin:
                                '8px 0 0',
                            }}
                          >
                            Distance:{' '}
                            {Math.round(
                              distance
                            )}{' '}
                            meters away.
                            <br />
                            Walk closer to
                            unlock
                          </p>
                        )}
                      </div>
                    </Popup>
                  </Circle>
                );
              })}

            </MapContainer>
          </div>
        </div>

        {/* Map information */}

        <div className="map-info-bar">

          <div className="map-info-card">
            <p className="map-info-label">
              Nearby
            </p>

            <p className="map-info-value">
              {nearbyLandmarks} landmark
              {nearbyLandmarks === 1
                ? ''
                : 's'}
            </p>
          </div>

          <div className="map-info-card">
            <p className="map-info-label">
              Campus Progress
            </p>

            <p className="map-info-value">
              {discoveredLandmarks.length}
              {' / '}
              {LANDMARKS.length}
              {' '}landmarks discovered
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}