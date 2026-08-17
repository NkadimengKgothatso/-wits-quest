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
    <div class="gps-pin">
      <div class="gps-pin-glow"></div>
      <div class="gps-pin-head"></div>
    </div>
  `,
  iconSize: [34, 44],
  iconAnchor: [17, 42],
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
      <rect
        x="4" y="4" width="12" height="18"
        rx="1.5"
        fill="#8b5fc7"
        opacity="0.5"
      />
      <circle
        cx="10"
        cy="13"
        r="3.2"
        fill="#f5c37a"
      />
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
    window.visualViewport?.addEventListener('resize', invalidate);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);

      window.removeEventListener('resize', invalidate);
      window.removeEventListener('orientationchange', invalidate);

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

              return [...previous, landmark.name];
            });
          }
        });
      },

      (error) => {
        if (error.code === error.PERMISSION_DENIED) {
          setLocationError(
            'Location permission denied. Enable it in your browser settings to see your position on the map.'
          );
        } else if (error.code === error.POSITION_UNAVAILABLE) {
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
          background:
            radial-gradient(
              circle at top,
              rgba(73, 104, 148, 0.18),
              transparent 45%
            ),
            #FAF7F2;
          padding: 8px 18px 28px;
          overflow-y: auto;
          overscroll-behavior: none;
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

        /* Glowing GPS location pin */
        .gps-pin {
          width: 34px;
          height: 44px;
          position: relative;
          display: flex;
          justify-content: center;
          align-items: flex-start;
        }

        .gps-pin-glow {
          position: absolute;
          top: 1px;
          width: 28px;
          height: 28px;
          border-radius: 50% 50% 50% 0;
          background: rgba(211, 122, 50, 0.35);
          transform: rotate(-45deg);
          animation: gps-glow 2s ease-out infinite;
        }

        .gps-pin-head {
          position: absolute;
          top: 2px;
          width: 25px;
          height: 25px;
          border-radius: 50% 50% 50% 0;
          background: #D37A32;
          border: 3px solid #ffffff;
          box-shadow:
            0 2px 8px rgba(0, 0, 0, 0.4),
            0 0 12px rgba(211, 122, 50, 0.8);
          transform: rotate(-45deg);
        }

        .gps-pin-head::after {
          content: '';
          position: absolute;
          width: 7px;
          height: 7px;
          background: #ffffff;
          border-radius: 50%;
          top: 6px;
          left: 6px;
        }

        @keyframes gps-glow {
          0% {
            transform: rotate(-45deg) scale(0.8);
            opacity: 0.8;
          }

          70% {
            transform: rotate(-45deg) scale(1.5);
            opacity: 0;
          }

          100% {
            transform: rotate(-45deg) scale(1.5);
            opacity: 0;
          }
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
        }
      `}</style>

      {locationError && (
        <div className="location-error-banner">
          {locationError}
        </div>
      )}

      <header className="map-header">
        <h1 className="map-title">
          Explore Campus
        </h1>

        <p className="map-subtitle">
          Discover landmarks and unlock trivia as you explore Wits.
        </p>
      </header>

      <div className="map-card">
        <div className="map-frame">
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
                  You are here
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

              const status =
                distance !== null &&
                distance <= 25
                  ? 'IN_RADIUS'
                  : 'OUT_OF_RANGE';

              return (
                <Marker
                  key={landmark.name}
                  position={landmark.position}
                  icon={landmarkIcon}
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
                            margin: '8px 0 0',
                          }}
                        >
                          Waiting for your location...
                        </p>
                      ) : status === 'IN_RADIUS' ? (
                        <>
                          <p
                            style={{
                              margin: '8px 0',
                              fontWeight: 600,
                            }}
                          >
                            IN RADIUS
                          </p>

                          <button
                            className="trivia-button"
                            onClick={() =>
                              onOpenTrivia?.(landmark)
                            }
                          >
                            Start Trivia Challenge
                          </button>
                        </>
                      ) : (
                        <p
                          style={{
                            margin: '8px 0 0',
                          }}
                        >
                          Distance:{' '}
                          {Math.round(distance)}
                          {' '}meters away.
                          <br />
                          Walk closer to unlock
                        </p>
                      )}
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      </div>

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
            {discoveredLandmarks.length} / {LANDMARKS.length}
            {' '}landmarks discovered
          </p>
        </div>
      </div>
    </div>
  );
}