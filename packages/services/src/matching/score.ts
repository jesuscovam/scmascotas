import { colorsOverlap } from './color-normalize.js';
import { cosineSimilarity, visualScore } from './cosine.js';

export type SpottedInput = {
  type:       'dog' | 'cat' | 'other';
  coloniaId:  string | null | undefined;
  color:      string | null | undefined;
  size:       string | null | undefined;
  createdAt:  Date | string;
  embedding?: number[] | null;
};

export type MissingInput = {
  type:       'dog' | 'cat' | 'other';
  coloniaId:  string | null | undefined;
  color:      string | null | undefined;
  size:       string | null | undefined;
  lastSeenAt: Date | string;
  embedding?: number[] | null;
};

export type MatchBreakdown = {
  colonia:   number;
  color:     number;
  size:      number;
  recency:   number;
  visual:    number;
  total:     number;   // 0–100
  hasVisual: boolean;  // true → photo-backed scoring path was used
};

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
    colonia: 0, color: 0, size: 0, recency: 0, visual: 0, total: 0, hasVisual: false,
  };
  if (spotted.type !== missing.type) return zero;

  const sameColonia = !!spotted.coloniaId && !!missing.coloniaId && spotted.coloniaId === missing.coloniaId;
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
    const colonia = sameColonia ? 15 : 0;
    const color   = colorMatch  ? 10 : 0;
    const size    = sameSize    ? 8  : 0;
    const recency = recent      ? 7  : 0;
    return {
      colonia, color, size, recency, visual,
      total: visual + colonia + color + size + recency,
      hasVisual: true,
    };
  }

  // Metadata-only: expand weights to fill 0–100 since no visual evidence is available.
  const colonia = sameColonia ? 40 : 0;
  const color   = colorMatch  ? 25 : 0;
  const size    = sameSize    ? 20 : 0;
  const recency = recent      ? 15 : 0;
  return {
    colonia, color, size, recency, visual: 0,
    total: colonia + color + size + recency,
    hasVisual: false,
  };
}
