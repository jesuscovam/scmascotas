import { colorsOverlap } from './color-normalize.js';

export type SpottedInput = {
  type:      'dog' | 'cat' | 'other';
  coloniaId: string | null | undefined;
  color:     string | null | undefined;
  size:      string | null | undefined;
  createdAt: Date | string;
};

export type MissingInput = {
  type:       'dog' | 'cat' | 'other';
  coloniaId:  string | null | undefined;
  color:      string | null | undefined;
  size:       string | null | undefined;
  lastSeenAt: Date | string;
};

export type MatchBreakdown = {
  type:    number;   // 0 or 40
  colonia: number;   // 0 or 30
  color:   number;   // 0 or 10
  size:    number;   // 0 or 10
  recency: number;   // 0 or 10
  total:   number;
};

export function scoreMatch(spotted: SpottedInput, missing: MissingInput): MatchBreakdown {
  const zero = { type: 0, colonia: 0, color: 0, size: 0, recency: 0, total: 0 };
  if (spotted.type !== missing.type) return zero;

  const typeScore    = 40;
  const coloniaScore = spotted.coloniaId && missing.coloniaId && spotted.coloniaId === missing.coloniaId ? 30 : 0;
  const colorScore   = colorsOverlap(spotted.color, missing.color) ? 10 : 0;
  const sizeScore    = spotted.size && missing.size && spotted.size === missing.size ? 10 : 0;
  const daysDiff     = Math.abs((new Date(spotted.createdAt).getTime() - new Date(missing.lastSeenAt).getTime()) / 86_400_000);
  const recencyScore = daysDiff <= 30 ? 10 : 0;

  const total = typeScore + coloniaScore + colorScore + sizeScore + recencyScore;
  return { type: typeScore, colonia: coloniaScore, color: colorScore, size: sizeScore, recency: recencyScore, total };
}
