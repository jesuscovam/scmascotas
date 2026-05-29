import { env } from '$env/dynamic/public';

const STADIA_KEY = env.PUBLIC_STADIA_MAPS_KEY ?? '';

/**
 * Tile URL template + attribution for Leaflet's `L.tileLayer()`.
 *
 * With a Stadia Maps key: uses their `outdoors` style — clearer terrain
 * cues than the default OSM raster (relevant for hilly San Cristóbal).
 *
 * Without a key: direct OpenStreetMap tiles. OSM's tile usage policy
 * limits this to ~100k tiles/day per project — fine for dev and small
 * forks, but production should set the env. We never silently route
 * production traffic at OSM's free tile servers.
 */
export const tileUrl: string = STADIA_KEY
  ? `https://tiles.stadiamaps.com/tiles/outdoors/{z}/{x}/{y}{r}.png?api_key=${STADIA_KEY}`
  : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

export const tileAttribution: string = STADIA_KEY
  ? '&copy; <a href="https://stadiamaps.com/" target="_blank">Stadia Maps</a>, ' +
    '&copy; <a href="https://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors'
  : '&copy; <a href="https://openstreetmap.org/copyright" target="_blank">OpenStreetMap</a> contributors';

/** San Cristóbal de las Casas — sensible default centre for every map. */
export const SC_CENTER: { lat: number; lng: number } = { lat: 16.737, lng: -92.6376 };
export const SC_DEFAULT_ZOOM = 14;
