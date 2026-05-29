import { describe, it, expect } from 'vitest';
import { scoreMatch } from './score.js';
import { colorsOverlap } from './color-normalize.js';

const NOW = new Date('2026-05-24T12:00:00Z');

// 768-dim embeddings — minimal vectors that make cosineSimilarity behave as we want.
const identical768   = (n: number) => Array.from({ length: 768 }, (_, i) => Math.sin(i + n));
const embA           = identical768(0);
const embA_copy      = [...embA];                                    // cosine 1.0 → 60 pts
const embOrth        = Array.from({ length: 768 }, (_, i) => Math.cos(i)); // ~uncorrelated
const noPhoto        = null;

const base = {
  spotted: {
    type: 'dog' as const, coloniaId: 'col-1', color: 'negro con manchas',
    size: 'medium', createdAt: NOW,
  },
  missing: {
    type: 'dog' as const, coloniaId: 'col-1', color: 'negro con manchas',
    size: 'medium', lastSeenAt: NOW,
  },
};

describe('colorsOverlap', () => {
  it('matches synonyms across groups: café / marrón', () => {
    expect(colorsOverlap('café', 'marrón')).toBe(true);
  });
  it('matches with accents stripped: gris / grisáceo', () => {
    expect(colorsOverlap('gris', 'grisáceo')).toBe(true);
  });
  it('does not match different color groups', () => {
    expect(colorsOverlap('negro', 'blanco')).toBe(false);
  });
  it('matches when one value contains the word in context', () => {
    expect(colorsOverlap('negro con manchas blancas', 'blanco y negro')).toBe(true);
  });
  it('returns false when either value is null', () => {
    expect(colorsOverlap(null, 'negro')).toBe(false);
    expect(colorsOverlap('negro', null)).toBe(false);
  });
});

describe('scoreMatch — gatekeeper', () => {
  it('short-circuits to 0 on species mismatch (even with identical embeddings)', () => {
    const result = scoreMatch(
      { ...base.spotted, type: 'cat', embedding: embA },
      { ...base.missing, embedding: embA_copy },
    );
    expect(result.total).toBe(0);
    expect(result.hasVisual).toBe(false);
  });
});

describe('scoreMatch — metadata-only path (no embeddings)', () => {
  it('perfect metadata + no photos = 100', () => {
    const result = scoreMatch(
      { ...base.spotted, embedding: noPhoto },
      { ...base.missing, embedding: noPhoto },
    );
    expect(result.hasVisual).toBe(false);
    expect(result.colonia).toBe(40);
    expect(result.color).toBe(25);
    expect(result.size).toBe(20);
    expect(result.recency).toBe(15);
    expect(result.total).toBe(100);
  });

  it('only colonia matches → 40', () => {
    const result = scoreMatch(
      { ...base.spotted, color: 'blanco', size: 'large', createdAt: new Date('2024-01-01') },
      { ...base.missing },
    );
    expect(result.total).toBe(40);
  });

  it('today\'s false positive: different colonia + different color, no photos → 20 (size + recency only)', () => {
    const result = scoreMatch(
      { ...base.spotted, coloniaId: 'col-a', color: 'naranja' },
      { ...base.missing, coloniaId: 'col-b', color: 'gris' },
    );
    expect(result.total).toBe(35); // size 20 + recency 15
  });
});

describe('scoreMatch — photo-backed path (both embeddings)', () => {
  it('identical embedding + perfect metadata = 100', () => {
    const result = scoreMatch(
      { ...base.spotted, embedding: embA },
      { ...base.missing, embedding: embA_copy },
    );
    expect(result.hasVisual).toBe(true);
    expect(result.visual).toBe(60);
    expect(result.colonia).toBe(15);
    expect(result.color).toBe(10);
    expect(result.size).toBe(8);
    expect(result.recency).toBe(7);
    expect(result.total).toBe(100);
  });

  it('identical embedding alone (no metadata match) still surfaces as strong: 60', () => {
    const result = scoreMatch(
      { ...base.spotted, coloniaId: 'col-x', color: 'blanco', size: 'large',
        createdAt: new Date('2024-01-01'), embedding: embA },
      { ...base.missing, embedding: embA_copy },
    );
    expect(result.total).toBe(60);
  });

  it('orthogonal embedding + same metadata: visual 0, total = metadata-light path (15+10+8+7 = 40)', () => {
    const result = scoreMatch(
      { ...base.spotted, embedding: embOrth },
      { ...base.missing, embedding: embA },
    );
    expect(result.hasVisual).toBe(true);
    expect(result.visual).toBe(0);
    expect(result.total).toBe(40);
  });

  it('today\'s false positive with weak CLIP coincidence stays below threshold', () => {
    // orange cat in colonia A, gray cat in colonia B, both medium, sighted >30d after lost,
    // CLIP sees ~0.65 (orthogonal embeddings): below 0.70 floor → 0 visual.
    const result = scoreMatch(
      { ...base.spotted, coloniaId: 'col-a', color: 'naranja',
        createdAt: new Date('2026-07-01'), embedding: embOrth },
      { ...base.missing, coloniaId: 'col-b', color: 'gris',
        lastSeenAt: new Date('2026-05-01'), embedding: embA },
    );
    expect(result.visual).toBe(0);
    expect(result.total).toBeLessThan(30); // hidden — below MATCH_THRESHOLD
  });
});

describe('scoreMatch — total never exceeds 100', () => {
  it('photo-backed perfect match caps at 100', () => {
    const result = scoreMatch(
      { ...base.spotted, embedding: embA },
      { ...base.missing, embedding: embA_copy },
    );
    expect(result.total).toBeLessThanOrEqual(100);
  });
  it('metadata-only perfect match caps at 100', () => {
    const result = scoreMatch(base.spotted, base.missing);
    expect(result.total).toBeLessThanOrEqual(100);
  });
});

describe('scoreMatch — geo proximity (Sprint 6)', () => {
  const precise = { locationPrecision: 'precise' as const };
  const CENTRO = { lat: 16.737, lng: -92.6376 };
  // ~1km east of CENTRO at SC latitude (1 deg lng ≈ 106 km at 16.7°N)
  const EAST_1KM = { lat: 16.737, lng: -92.6282 };
  // ~3km east
  const EAST_3KM = { lat: 16.737, lng: -92.6094 };

  it('reports proximityMeters when both sides have precise locations', () => {
    const result = scoreMatch(
      { ...base.spotted, ...precise, ...CENTRO },
      { ...base.missing, ...precise, ...CENTRO },
    );
    expect(result.proximityMeters).toBeGreaterThanOrEqual(0);
    expect(result.proximityMeters).toBeLessThan(1);
  });

  it('within 500m: colonia score holds at full weight (metadata-only)', () => {
    const result = scoreMatch(
      { ...base.spotted, ...precise, ...CENTRO },
      { ...base.missing, ...precise, lat: 16.7373, lng: -92.6376 }, // ~30m north
    );
    expect(result.colonia).toBe(40);
  });

  it('at ~1750m: colonia score halves (metadata-only)', () => {
    const result = scoreMatch(
      { ...base.spotted, ...precise, ...CENTRO },
      { ...base.missing, ...precise, lat: 16.737, lng: -92.6258 }, // ~1.25km east → midway
    );
    // 40 * (1 - (1250-500)/2500) = 40 * 0.7 = 28
    expect(result.colonia).toBeGreaterThanOrEqual(25);
    expect(result.colonia).toBeLessThanOrEqual(35);
  });

  it('beyond 3km: colonia score drops to 0 even when colonia IDs match', () => {
    const result = scoreMatch(
      { ...base.spotted, ...precise, ...CENTRO },
      { ...base.missing, ...precise, ...EAST_3KM }, // same coloniaId but far apart
    );
    expect(result.colonia).toBe(0);
  });

  it('photo-backed path: geo modulates the 15-pt colonia component', () => {
    const result = scoreMatch(
      { ...base.spotted, ...precise, ...CENTRO, embedding: embA },
      { ...base.missing, ...precise, ...EAST_3KM, embedding: embA_copy },
    );
    expect(result.hasVisual).toBe(true);
    expect(result.colonia).toBe(0);
    expect(result.visual).toBe(60); // visual still fires — embeddings match
  });

  it('legacy rows (one side colonia-precision): falls back to colonia-ID match', () => {
    const result = scoreMatch(
      { ...base.spotted, ...precise, ...CENTRO },
      { ...base.missing, locationPrecision: 'colonia', lat: null, lng: null },
    );
    // Same coloniaId → falls back to 1.0 confidence
    expect(result.colonia).toBe(40);
    expect(result.proximityMeters).toBeNull();
  });

  it('legacy rows with different colonias: 0 colonia score, no geo bonus', () => {
    const result = scoreMatch(
      { ...base.spotted, ...precise, ...CENTRO, coloniaId: 'col-a' },
      { ...base.missing, locationPrecision: 'unknown', lat: null, lng: null, coloniaId: 'col-b' },
    );
    expect(result.colonia).toBe(0);
  });
});
