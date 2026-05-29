import type { LatLng } from '@scmascotas/schemas';

/**
 * Deterministically fuzz a precise lat/lng into a point uniformly distributed
 * inside a circle of radius `meters` around the original. Same `seed` always
 * produces the same fuzzed point — so a pet's public map pin stays stable
 * across renders, but the real address is never exposed.
 *
 * Privacy default: 150m. Tweak per surface if needed.
 *
 * Math: meters-to-degrees uses the standard 111,000 m/° for latitude and
 * `111,000 * cos(lat)` m/° for longitude. Accurate enough for sub-kilometer
 * offsets at San Cristóbal's latitude (~16.7°); breaks down near the poles.
 */
export function fuzz(point: LatLng, seed: string, meters = 150): LatLng {
  const prng = mulberry32(hashString(seed));
  const angle = prng() * 2 * Math.PI;
  // sqrt distribution → uniform by area, not by radius
  const distance = Math.sqrt(prng()) * meters;

  const dxMeters = distance * Math.cos(angle);
  const dyMeters = distance * Math.sin(angle);

  const latRad = (point.lat * Math.PI) / 180;
  const dLat = dyMeters / 111_000;
  const dLng = dxMeters / (111_000 * Math.cos(latRad));

  return {
    lat: point.lat + dLat,
    lng: point.lng + dLng
  };
}

/**
 * Universal Google Maps URL. On Android with the Google Maps app installed,
 * the OS deep-links into the app; otherwise it opens maps.google.com in the
 * browser. Works on iOS too if the user prefers Google Maps over Apple Maps.
 */
export function googleMapsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

/**
 * Google Maps "get directions" URL — drops the user straight into the
 * navigation flow with the location preset as the destination.
 */
export function googleMapsDirectionsUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

/**
 * Apple Maps URL. iOS will open the Apple Maps app; other platforms fall
 * back to the web view which redirects users on toward Google Maps anyway.
 */
export function appleMapsUrl(lat: number, lng: number): string {
  return `https://maps.apple.com/?q=${lat.toFixed(6)},${lng.toFixed(6)}`;
}

/**
 * Haversine great-circle distance in meters between two lat/lng points.
 * Useful for client-side "how far is this pet?" hints; matching uses
 * PostGIS `ST_Distance` server-side.
 */
export function haversineMeters(a: LatLng, b: LatLng): number {
  const R = 6_371_000; // Earth radius in meters
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);
  const sinDLat = Math.sin(dLat / 2);
  const sinDLng = Math.sin(dLng / 2);
  const h = sinDLat * sinDLat + sinDLng * sinDLng * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.min(1, Math.sqrt(h)));
}

// --- internal helpers ---

function hashString(s: string): number {
  // FNV-1a 32-bit
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number): () => number {
  let state = seed;
  return function () {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
