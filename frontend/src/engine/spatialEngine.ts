export interface Coordinates {
  lat: number;
  lng: number;
}

/**
 * Calculates distance in meters between two geographical points using the Haversine formula.
 */
export function calculateHaversineDistance(point1: Coordinates, point2: Coordinates): number {
  const EARTH_RADIUS_METERS = 6371000;
  const dLat = ((point2.lat - point1.lat) * Math.PI) / 180;
  const dLng = ((point2.lng - point1.lng) * Math.PI) / 180;

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((point1.lat * Math.PI) / 180) *
      Math.cos((point2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return EARTH_RADIUS_METERS * c;
}

/**
 * Verifies if user is within the required activation radius of a campus event.
 */
export function isWithinEventRadius(userCoords: Coordinates, eventCoords: Coordinates, radiusMeters: number): boolean {
  const distance = calculateHaversineDistance(userCoords, eventCoords);
  return distance <= radiusMeters;
}
