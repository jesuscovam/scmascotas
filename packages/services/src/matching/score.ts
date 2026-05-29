import { colorsOverlap } from './color-normalize.js';
import { cosineSimilarity, visualScore } from './cosine.js';
import { haversineMeters } from '../location.js';

export type SpottedInput = {
  type:               'dog' | 'cat' | 'other';
  coloniaId:          string | null | undefined;
  color:              string | null | undefined;
  size:               string | null | undefined;
  createdAt:          Date | string;
  embedding?:         number[] | null;
  lat?:               number | null;
  lng?:               number | null;
  locationPrecision?: 'precise' | 'colonia' | 'unknown' | null;
};

export type MissingInput = {
  type:               'dog' | 'cat' | 'other';
  coloniaId:          string | null | undefined;
  color:              string | null | undefined;
  size:               string | null | undefined;
  lastSeenAt:         Date | string;
  embedding?:         number[] | null;
  lat?:               number | null;
  lng?:               number | null;
  locationPrecision?: 'precise' | 'colonia' | 'unknown' | null;
};

export type MatchBreakdown = {
  colonia:        number;
  color:          number;
  size:           number;
  recency:        number;
  visual:         number;
  total:          number;   // 0–100
  hasVisual:      boolean;  // true → photo-backed scoring path was used
  proximityMeters: number | null; // null when geo distance wasn't available
};

/**
 * Proximity confidence 0..1.
 *   When both reports have precise lat/lng: 1 within 500m, linear decay
 *   to 0 at 3000m. This modulates the colonia score so two pets in the
 *   same colonia but 2km apart score lower than two pets 100m apart.
 *
 *   When either side lacks precise location: fall back to colonia-ID
 *   match (1 if same colonia, 0 otherwise) — preserves pre-Sprint 6
 *   behaviour for legacy / centroid-only rows.
 */
function proximityConfidence(
  spotted: SpottedInput,
  missing: MissingInput,
): { confidence: number; meters: number | null } {
  const bothPrecise =
    spotted.locationPrecision === 'precise' &&
    missing.locationPrecision === 'precise' &&
    typeof spotted.lat === 'number' && typeof spotted.lng === 'number' &&
    typeof missing.lat === 'number' && typeof missing.lng === 'number';

  if (bothPrecise) {
    const meters = haversineMeters(
      { lat: spotted.lat!, lng: spotted.lng! },
      { lat: missing.lat!, lng: missing.lng! },
    );
    if (meters <= 500) return { confidence: 1, meters };
    if (meters >= 3000) return { confidence: 0, meters };
    return { confidence: 1 - (meters - 500) / 2500, meters };
  }

  const sameColonia = !!spotted.coloniaId && !!missing.coloniaId && spotted.coloniaId === missing.coloniaId;
  return { confidence: sameColonia ? 1 : 0, meters: null };
}

/**
 * Score a candidate match on a 0–100 scale.
 *
 * Type is a gatekeeper, not a score component: mismatched species → 0.
 *
 * Two scoring paths share the same ceiling so a user never sees "90/100"
 * without real visual evidence to back it up:
 *
 *   Photo-backed (both sides have an embedding):
 *     visual 0–60 + colonia 0–15 + color 0–10 + size 0–8 + recency 0–7 = max 100
 *
 *   Metadata-only (at least one side missing embedding):
 *     colonia 0–40 + color 0–25 + size 0–20 + recency 0–15 = max 100
 */
export function scoreMatch(spotted: SpottedInput, missing: MissingInput): MatchBreakdown {
  const zero: MatchBreakdown = {
    colonia: 0, color: 0, size: 0, recency: 0, visual: 0, total: 0, hasVisual: false, proximityMeters: null,
  };
  if (spotted.type !== missing.type) return zero;

  const { confidence: proximity, meters: proximityMeters } = proximityConfidence(spotted, missing);
  const sameSize    = !!spotted.size && !!missing.size && spotted.size === missing.size;
  const colorMatch  = colorsOverlap(spotted.color, missing.color);
  const daysApart   = Math.abs(
    (new Date(spotted.createdAt).getTime() - new Date(missing.lastSeenAt).getTime()) / 86_400_000,
  );
  const recent = daysApart <= 30;

  const hasVisual =
    spotted.embedding?.length === 768 &&
    missing.embedding?.length === 768;

  if (hasVisual) {
    const visual  = visualScore(cosineSimilarity(spotted.embedding!, missing.embedding!));
    const colonia = Math.round(15 * proximity);
    const color   = colorMatch ? 10 : 0;
    const size    = sameSize   ? 8  : 0;
    const recency = recent     ? 7  : 0;
    return {
      colonia, color, size, recency, visual,
      total: visual + colonia + color + size + recency,
      hasVisual: true,
      proximityMeters,
    };
  }

  // Metadata-only: expand weights to fill 0–100 since no visual evidence is available.
  const colonia = Math.round(40 * proximity);
  const color   = colorMatch ? 25 : 0;
  const size    = sameSize   ? 20 : 0;
  const recency = recent     ? 15 : 0;
  return {
    colonia, color, size, recency, visual: 0,
    total: colonia + color + size + recency,
    hasVisual: false,
    proximityMeters,
  };
}
