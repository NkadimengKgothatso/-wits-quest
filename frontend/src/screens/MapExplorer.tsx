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
import { useAuth } from '../context/AuthContext';
import { getEvents, getCompletedEvents, type CampusEvent } from '../services/apiClient';

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

function getEventHeatIcon(inRange: boolean, isCompleted: boolean) {
  let pinClass = 'out-of-range';
  let icon = '🔒';
  
  if (isCompleted) {
    pinClass = 'completed';
    icon = '🔓'; 
  } else if (inRange) {
    pinClass = 'in-range';
    icon = '🔓';
  }

  return new L.DivIcon({
    className: 'event-heat-marker',
    html: `
      <div class="event-heat-pin ${pinClass}">
        <span class="event-icon">${icon}</span>
      </div>
    `,
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -18],
  });
}

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
  const { currentUser } = useAuth();

  const [userPosition, setUserPosition] =
    useState<[number, number] | null>(null);

  const [locationError, setLocationError] =
    useState<string | null>(null);

  // Keeps track of landmarks the player has reached.
  const [discoveredLandmarks, setDiscoveredLandmarks] =
    useState<string[]>([]);

  // Active campus events created by admins.
  const [activeEvents, setActiveEvents] = useState<CampusEvent[]>([]);
  
  // Events the player has fully completed
  const [completedEvents, setCompletedEvents] = useState<string[]>([]);
  
  const loadCompletedEvents = () => {
    if (currentUser?.id) {
      getCompletedEvents().then(setCompletedEvents).catch(() => {});
    }
  };

  useEffect(() => {
    loadCompletedEvents();
    
    // Listen for when trivia is completed to re-fetch the status
    window.addEventListener('triviaCompleted', loadCompletedEvents);
    return () => window.removeEventListener('triviaCompleted', loadCompletedEvents);
  }, [currentUser?.id]);

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

        // SEND GPS LOCATION TO TELEMETRY ENDPOINT

        if (currentUser?.id) {
          fetch(
            'http://localhost:3000/api/mock/telemetry/ping',
            {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                userId: currentUser.id,
                lat: position.coords.latitude,
                lng: position.coords.longitude,
                timestamp: new Date().toISOString(),
              }),
            }
          ).catch(() => {
            // Ignore telemetry failures so they do not
            // interrupt the player's map experience.
          });
        }

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
  }, [currentUser?.id]);

  // Fetch active campus events
  useEffect(() => {
    getEvents(true)
      .then((events) => setActiveEvents(events.filter((e) => e.active === 1)))
      .catch(() => setActiveEvents([]));
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
          overflow: hidden;
          background: transparent;
          padding: 8px 18px 28px;
          overscroll-behavior: none;
        }

        .map-content {
          position: relative;
          z-index: 2;
          width: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .scroll-wrapper {
          width: min(100%, 1400px);
          display: flex;
          flex-direction: row;
          align-items: center;
          position: relative;
          margin-top: 40px;
        }

        .scroll-roller {
          height: clamp(500px, 75vh, 800px);
          width: 24px;
          flex-shrink: 0;
          border-radius: 12px;
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
          height: 16px;
          border-radius: 50%;
          background: radial-gradient(circle at 35% 35%, #b8905c, #5a3f20);
          box-shadow: 0 2px 6px rgba(0,0,0,0.5);
        }

        .scroll-roller::before { top: -5px; }
        .scroll-roller::after { bottom: -5px; }

        .map-frame {
          flex: 1;
          min-width: 0;
          height: clamp(500px, 75vh, 800px);
          position: relative;
          z-index: 1;
          overflow: hidden;
          background: #f0e2c0;
          border-top: 6px solid #d9c290;
          border-bottom: 6px solid #d9c290;
          box-shadow:
            inset 0 0 30px rgba(90, 63, 32, 0.35),
            0 0 0 1px rgba(90, 63, 32, 0.2);
        }



        .map-info-card {
          position: absolute;
          left: 26px;
          bottom: 20px;
          z-index: 1000;
          background: #f5ecd7;
          border-radius: 14px;
          padding: 12px 15px;
          border: 2px solid #4a3620;
          box-shadow:
            0 4px 12px rgba(0, 0, 0, 0.35);
        }

        .map-info-label {
          margin: 0 0 3px;
          font-family: system-ui, sans-serif;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.8px;
          text-transform: uppercase;
          color: #7a6644;
        }

        .map-info-value {
          margin: 0;
          font-family: Georgia, serif;
          font-size: 17px;
          font-weight: 700;
          color: #4a3620;
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

        .event-area-circle {
          animation: event-pulse 2s ease-in-out infinite;
        }

        .event-heat-pin {
          width: 36px;
          height: 36px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 16px;
          border: 3px solid #fffefc;
          transition: all 0.3s ease;
        }

        .event-heat-pin.in-range {
          background: #2e7d32;
          box-shadow: 0 0 0 4px rgba(46, 125, 50, 0.4), 0 2px 8px rgba(0,0,0,0.4);
          animation: event-heat-pulse-in 1.5s infinite;
        }

        .event-heat-pin.completed {
          background: #D37A32;
          font-family: Georgia, serif;
          font-weight: 900;
          color: white;
          box-shadow: 0 0 0 4px rgba(211, 122, 50, 0.4), 0 2px 8px rgba(0,0,0,0.4);
          animation: event-heat-pulse-completed 3s infinite;
        }

        .event-heat-pin.out-of-range {
          background: #b3261e;
          box-shadow: 0 0 0 4px rgba(179, 38, 30, 0.4), 0 2px 8px rgba(0,0,0,0.4);
          animation: event-heat-pulse-out 2s infinite;
        }

        @keyframes event-heat-pulse-in {
          0% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0.6); }
          70% { box-shadow: 0 0 0 15px rgba(46, 125, 50, 0); }
          100% { box-shadow: 0 0 0 0 rgba(46, 125, 50, 0); }
        }

        @keyframes event-heat-pulse-completed {
          0% { box-shadow: 0 0 0 0 rgba(211, 122, 50, 0.6); }
          70% { box-shadow: 0 0 0 10px rgba(211, 122, 50, 0); }
          100% { box-shadow: 0 0 0 0 rgba(211, 122, 50, 0); }
        }

        @keyframes event-heat-pulse-out {
          0% { box-shadow: 0 0 0 0 rgba(179, 38, 30, 0.6); }
          70% { box-shadow: 0 0 0 10px rgba(179, 38, 30, 0); }
          100% { box-shadow: 0 0 0 0 rgba(179, 38, 30, 0); }
        }

        .landmark-circle {
          stroke: none;
          fill: #4a3620;
          fill-opacity: 0.22;
          filter:
            blur(1.5px)
            drop-shadow(0 0 10px rgba(74, 54, 32, 0.55));
          animation:
            landmark-pulse 2.8s ease-in-out infinite;
        }

        .landmark-circle-nearby {
          stroke: none;
          fill: #D37A32;
          fill-opacity: 0.3;
          filter:
            blur(1.5px)
            drop-shadow(0 0 16px rgba(211, 122, 50, 0.75));
          animation:
            landmark-nearby-pulse 1.4s ease-in-out infinite;
        }

        .landmark-circle-discovered {
          stroke: none;
          fill: #496894;
          fill-opacity: 0.26;
          filter:
            blur(1.5px)
            drop-shadow(0 0 12px rgba(73, 104, 148, 0.6));
        }

        @keyframes landmark-pulse {
          0%, 100% {
            fill-opacity: 0.16;
          }

          50% {
            fill-opacity: 0.3;
          }
        }

        @keyframes landmark-nearby-pulse {
          0%, 100% {
            fill-opacity: 0.24;
            transform: scale(1);
          }

          50% {
            fill-opacity: 0.4;
            transform: scale(1.08);
          }
        }

        .map-compass {
          position: absolute;
          top: 14px;
          right: 14px;
          width: 66px;
          height: 66px;
          z-index: 1000;
          border-radius: 50%;
          background:
            radial-gradient(
              circle at 40% 35%,
              #fdf6e3,
              #f0e2c0 60%,
              #d9c290 100%
            );
          border: 3px solid #4a3620;
          box-shadow:
            0 3px 14px rgba(0, 0, 0, 0.4),
            inset 0 0 0 3px rgba(255, 254, 250, 0.6),
            inset 0 0 10px rgba(90, 63, 32, 0.35);
          display: flex;
          align-items: center;
          justify-content: center;
          font-family: system-ui, sans-serif;
          font-weight: 800;
          font-size: 10px;
        }

        .map-compass::before {
          content: '';
          position: absolute;
          inset: 6px;
          border-radius: 50%;
          background:
            repeating-conic-gradient(
              rgba(74, 54, 32, 0.55) 0deg 1.2deg,
              transparent 1.2deg 15deg
            );
          opacity: 0.55;
        }

        .map-compass::after {
          content: '';
          position: absolute;
          inset: 6px;
          border-radius: 50%;
          border: 1px solid rgba(74, 54, 32, 0.4);
        }

        .compass-north,
        .compass-east,
        .compass-south,
        .compass-west {
          position: absolute;
          color: #4a3620;
          font-family: Georgia, serif;
          font-weight: 900;
          z-index: 2;
        }

        .compass-north {
          top: 2px;
          left: 50%;
          transform: translateX(-50%);
          color: #b3261e;
        }

        .compass-east {
          right: 4px;
          top: 50%;
          transform: translateY(-50%);
        }

        .compass-south {
          bottom: 2px;
          left: 50%;
          transform: translateX(-50%);
        }

        .compass-west {
          left: 4px;
          top: 50%;
          transform: translateY(-50%);
        }

        .compass-needle {
          width: 26px;
          height: 26px;
          position: relative;
          transform: rotate(45deg);
          z-index: 2;
          filter: drop-shadow(0 1px 2px rgba(0, 0, 0, 0.4));
        }

        .compass-red,
        .compass-blue {
          position: absolute;
          left: 50%;
          width: 5px;
          height: 13px;
          transform: translateX(-50%);
        }

        .compass-red {
          top: 0;
          background: linear-gradient(180deg, #d9564f, #8f231c);
          clip-path: polygon(
            50% 0,
            100% 100%,
            50% 75%,
            0 100%
          );
        }

        .compass-blue {
          bottom: 0;
          background: linear-gradient(0deg, #496894, #1d3156);
          clip-path: polygon(
            50% 100%,
            100% 0,
            50% 25%,
            0 0
          );
        }

        .compass-center {
          position: absolute;
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background:
            radial-gradient(
              circle at 35% 30%,
              #fdf6e3,
              #caa25c 70%,
              #8a6538
            );
          border: 1px solid #4a3620;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
          z-index: 3;
        }

        .leaflet-control-zoom {
          border: none !important;
          box-shadow: none !important;
          margin: 14px !important;
        }

        .leaflet-control-zoom a {
          width: 38px !important;
          height: 36px !important;
          line-height: 34px !important;
          font-family: Georgia, serif !important;
          font-size: 20px !important;
          font-weight: 900 !important;
          color: #4a3620 !important;
          background:
            radial-gradient(
              circle at 35% 30%,
              #fdf6e3,
              #f0e2c0 65%,
              #d9c290
            ) !important;
          border: 2px solid #4a3620 !important;
          box-shadow:
            0 3px 8px rgba(0, 0, 0, 0.35),
            inset 0 0 0 1px rgba(255, 254, 250, 0.5) !important;
          transition: transform 0.15s ease, background 0.15s ease;
        }

        .leaflet-control-zoom-in {
          border-radius: 8px 8px 3px 3px !important;
          margin-bottom: 3px !important;
        }

        .leaflet-control-zoom-out {
          border-radius: 3px 3px 8px 8px !important;
        }

        .leaflet-control-zoom a:hover {
          background:
            radial-gradient(
              circle at 35% 30%,
              #fffefc,
              #e8d5a8 65%,
              #caa25c
            ) !important;
          transform: scale(1.07);
          color: #2e2013 !important;
        }

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

          .scroll-roller {
            width: 16px;
            height: 68vh;
            min-height: 420px;
          }

          .map-frame {
            height: 68vh;
            min-height: 420px;
          }

          .map-info-card {
            left: 16px;
            bottom: 14px;
          }

          .map-compass {
            top: 10px;
            right: 10px;
            width: 56px;
            height: 56px;
          }
        }
      `}</style>

      {locationError && (
        <div className="location-error-banner">
          {locationError}
        </div>
      )}

      <div className="map-content">

        <div className="scroll-wrapper">
          <div className="scroll-roller" />

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
                    radius={isNearby ? 22 : 16}
                    className={
                      isDiscovered
                        ? 'landmark-circle-discovered'
                        : isNearby
                        ? 'landmark-circle-nearby'
                        : 'landmark-circle'
                    }
                    pathOptions={{
                      color: 'transparent',

                      fillColor: isDiscovered
                        ? '#496894'
                        : isNearby
                        ? '#D37A32'
                        : '#4a3620',

                      fillOpacity: isDiscovered
                        ? 0.26
                        : isNearby
                        ? 0.32
                        : 0.2,

                      weight: 0,
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
            
              {activeEvents.map((evt) => {
                const distance = userPosition
                  ? haversineDistance(userPosition, [evt.lat, evt.lng])
                  : null;
                const inRange = distance !== null && distance <= evt.radius;
                const isCompleted = completedEvents.includes(evt.id);

                return (
                  <Marker
                    key={`${evt.id}-marker`}
                    position={[evt.lat, evt.lng]}
                    icon={getEventHeatIcon(inRange, isCompleted)}
                  >
                    <Popup>
                      <div style={{ textAlign: 'center', fontFamily: 'system-ui, sans-serif' }}>
                        <strong>{evt.name}</strong>
                        
                        {inRange ? (
                          <>
                            <p style={{ margin: '8px 0', fontWeight: 600, color: '#2e7d32' }}>
                              Event Unlocked!
                            </p>
                            {evt.cardReward && (
                              <p style={{ margin: '4px 0 0', fontSize: 12, color: '#4a3620' }}>
                                Reward: {evt.cardReward}
                              </p>
                            )}
                            <button
                              style={{
                                marginTop: 12, padding: '8px 16px', background: '#D37A32', 
                                color: 'white', border: 'none', borderRadius: 8, 
                                fontWeight: 700, cursor: 'pointer', width: '100%',
                                fontSize: 13
                              }}
                              onClick={() => onOpenTrivia?.(evt)}
                            >
                              Start Trivia Challenge
                            </button>
                          </>
                        ) : (
                          <>
                            <p style={{ margin: '8px 0 0', fontSize: 12 }}>
                              {distance !== null ? `Distance: ${Math.round(distance)}m` : 'Calculating...'}
                            </p>
                            <p style={{ margin: '4px 0 0', fontSize: 11, color: '#b3261e' }}>
                              Walk closer to unlock
                            </p>
                          </>
                        )}
                      </div>
                    </Popup>
                  </Marker>
                );
              })}
            
            </MapContainer>

            <div className="map-info-card">
              <p className="map-info-label">
                Nearby Landmarks
              </p>

              <p className="map-info-value">
                {nearbyLandmarks} landmark
                {nearbyLandmarks === 1
                  ? ''
                  : 's'}
              </p>
            </div>

            <div
              style={{
                position: 'absolute',
                left: 26,
                bottom: 100,
                zIndex: 1000,
                background: '#f5ecd7',
                borderRadius: 12,
                padding: '10px 14px',
                border: '2px solid #4a3620',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.35)',
                fontFamily: 'system-ui, sans-serif',
                fontSize: 12,
                color: '#4a3620',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                <div
                  style={{
                    width: 14,
                    height: 14,
                    borderRadius: '50%',
                    background: '#D37A32',
                    border: '2px solid #fffefc',
                    boxShadow: '0 0 0 2px rgba(211, 122, 50, 0.4)',
                  }}
                />
                <strong>Active Event</strong>
              </div>
              <p style={{ margin: 0, color: '#7a6644' }}>
                {activeEvents.length} active event{activeEvents.length === 1 ? '' : 's'} on campus
              </p>
            </div>
          </div>

          <div className="scroll-roller" />
        </div>

      </div>
    </div>
  );
}