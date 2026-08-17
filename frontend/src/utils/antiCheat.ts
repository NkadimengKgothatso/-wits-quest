
export interface GpsPing {
  lat: number;
  lng: number;
  timestamp: string;
}


export const SPEED_THRESHOLD_MS = 15;


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

export function calculateSpeed(from: GpsPing, to: GpsPing): number {
  const millisecondsApart =
    new Date(to.timestamp).getTime() - new Date(from.timestamp).getTime();
  const secondsApart = millisecondsApart / 1000;


  if (secondsApart <= 0) return 0;

  return haversineDistance(from, to) / secondsApart;
}


export function isSpeedViolation(from: GpsPing, to: GpsPing): boolean {
  return calculateSpeed(from, to) > SPEED_THRESHOLD_MS;
}