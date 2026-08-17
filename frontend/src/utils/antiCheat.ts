
/** A single GPS reading: where someone was, and when. */
export interface GpsPing {
  lat: number;
  lng: number;
  timestamp: string;
}

/** Above this speed, no human could have moved there. 15 m/s ≈ 54 km/h. */
export const SPEED_THRESHOLD_MS = 15;

/** A jump this far in this little time isn't movement — it's a position spoof. */
export const TELEPORT_MIN_DISTANCE_M = 200;
export const TELEPORT_MAX_SECONDS = 5;

/** How close a ping must be to a landmark before we name it. */
const LANDMARK_MATCH_RADIUS_M = 150;

/**
 * Distance in metres between two points on Earth.
 * Uses the Haversine formula, which accounts for the curve of the planet.
 */
export function haversineDistance(a: GpsPing, b: GpsPing): number {
  const R = 6371000; // Earth's radius in metres
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;

  const dLat = toRadians(b.lat - a.lat);
  const dLng = toRadians(b.lng - a.lng);
  const lat1 = toRadians(a.lat);
  const lat2 = toRadians(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2;

  return 2 * R * Math.asin(Math.sqrt(h));
}

/** Seconds elapsed between two readings. */
export function secondsBetween(from: GpsPing, to: GpsPing): number {
  return (new Date(to.timestamp).getTime() - new Date(from.timestamp).getTime()) / 1000;
}

/** How fast someone moved between two readings, in metres per second. */
export function calculateSpeed(from: GpsPing, to: GpsPing): number {
  const seconds = secondsBetween(from, to);

  // Identical or out-of-order timestamps can't produce a speed.
  if (seconds <= 0) return 0;

  return haversineDistance(from, to) / seconds;
}

/** True if the movement was too fast to be a real person walking or running. */
export function isSpeedViolation(from: GpsPing, to: GpsPing): boolean {
  return calculateSpeed(from, to) > SPEED_THRESHOLD_MS;
}

/** True if the student appeared to jump instantly across a large distance. */
export function isTeleport(from: GpsPing, to: GpsPing): boolean {
  const seconds = secondsBetween(from, to);
  if (seconds <= 0) return false;

  return (
    haversineDistance(from, to) >= TELEPORT_MIN_DISTANCE_M &&
    seconds <= TELEPORT_MAX_SECONDS
  );
}

/**
 * Campus landmarks, mirrored from MapExplorer.tsx.
 * TODO: import from a shared module once LANDMARKS is exported there.
 */
export const CAMPUS_LANDMARKS = [
  { name: 'Great Hall', lat: -26.192177415373987, lng: 28.030361941387124 },
  { name: 'Humphrey Raikes', lat: -26.192095332747023, lng: 28.03127963680826 },
  { name: 'Wartenweiler Library', lat: -26.191243529310864, lng: 28.03087176603622 },
  { name: 'Wits School of the Arts', lat: -26.192037583558378, lng: 28.032449581917486 },
  { name: 'William Cullen Library', lat: -26.190829656466303, lng: 28.029379817685918 },
  { name: 'Amphitheatre', lat: -26.190136656782915, lng: 28.029980890402594 },
  { name: 'John Moffat Pond', lat: -26.190189594404178, lng: 28.02955155274785 },
  { name: 'TW Kambule Mathematical Sciences Building', lat: -26.19046871964564, lng: 28.026841358802145 },
  { name: 'Wits Science Stadium', lat: -26.19066603191282, lng: 28.02523134259679 },
  { name: 'Tower of Light', lat: -26.18978053034198, lng: 28.02594511644781 },
  { name: 'The Matrix', lat: -26.189616064701625, lng: 28.030808592703018 },
  { name: 'Chamber of Mines', lat: -26.191709498016966, lng: 28.02699822101696 },
  { name: 'South West Engineering', lat: -26.19202018489526, lng: 28.02935054349668 },
  { name: 'Flower Hall', lat: -26.191733973644435, lng: 28.02620961472413 },
  { name: 'Wits Sturrock Park', lat: -26.19319213569335, lng: 28.021073663028996 },
  { name: 'Origins Centre', lat: -26.192977185786265, lng: 28.028291004158817 },
  { name: 'Old Mutual Sport Hall', lat: -26.189627614752393, lng: 28.029321916975654 },
  { name: 'John Moffat', lat: -26.190151568368808, lng: 28.029334082969147 },
];

/**
 * Names the closest campus landmark to a GPS reading.
 * Falls back to "Near X" for mid-campus positions, or coordinates if far off.
 */
export function nearestLandmarkName(ping: GpsPing): string {
  let closest = CAMPUS_LANDMARKS[0];
  let closestDistance = Infinity;

  for (const landmark of CAMPUS_LANDMARKS) {
    const d = haversineDistance(ping, {
      lat: landmark.lat,
      lng: landmark.lng,
      timestamp: ping.timestamp,
    });
    if (d < closestDistance) {
      closestDistance = d;
      closest = landmark;
    }
  }

  if (closestDistance <= LANDMARK_MATCH_RADIUS_M) return closest.name;
  if (closestDistance <= LANDMARK_MATCH_RADIUS_M * 3) return `Near ${closest.name}`;

  return `${ping.lat.toFixed(4)}, ${ping.lng.toFixed(4)}`;
}