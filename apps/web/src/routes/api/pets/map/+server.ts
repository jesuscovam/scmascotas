import { json, error } from '@sveltejs/kit';
import { PetsService, fuzz } from '@scmascotas/services';
import type { RequestHandler } from './$types';

function parseBound(value: string | null, name: string): number {
  if (!value) throw error(400, `Missing bound: ${name}`);
  const n = Number(value);
  if (!Number.isFinite(n)) throw error(400, `Invalid bound: ${name}`);
  return n;
}

export const GET: RequestHandler = async ({ url }) => {
  const north = parseBound(url.searchParams.get('north'), 'north');
  const south = parseBound(url.searchParams.get('south'), 'south');
  const east = parseBound(url.searchParams.get('east'), 'east');
  const west = parseBound(url.searchParams.get('west'), 'west');
  const type = url.searchParams.get('type') as 'dog' | 'cat' | 'other' | null;
  const sinceParam = url.searchParams.get('since');
  const since = sinceParam ? new Date(sinceParam) : undefined;

  const rows = await PetsService.listInBounds({
    north, south, east, west,
    type: type ?? undefined,
    status: 'missing',
    since,
  });

  // Fuzz coordinates before exposing publicly. Precise coords never leave the server.
  const points = rows.map((r) => {
    if (r.locationPrecision === 'precise' && r.lat != null && r.lng != null) {
      const fuzzed = fuzz({ lat: r.lat, lng: r.lng }, r.id);
      return { ...r, lat: fuzzed.lat, lng: fuzzed.lng };
    }
    return r;
  });

  return json({ points });
};
