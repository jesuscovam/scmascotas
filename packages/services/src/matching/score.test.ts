import { describe, it, expect } from 'vitest';
import { scoreMatch } from './score.js';
import { colorsOverlap } from './color-normalize.js';

const NOW = new Date('2026-05-24T12:00:00Z');
const base = {
  spotted: { type: 'dog' as const, coloniaId: 'col-1', color: 'negro con manchas', size: 'medium', createdAt: NOW },
  missing: { type: 'dog' as const, coloniaId: 'col-1', color: 'negro con manchas', size: 'medium', lastSeenAt: NOW },
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

describe('scoreMatch', () => {
  it('returns 100 for a perfect match', () => {
    expect(scoreMatch(base.spotted, base.missing).total).toBe(100);
  });
  it('short-circuits to 0 on species mismatch', () => {
    expect(scoreMatch({ ...base.spotted, type: 'cat' }, base.missing).total).toBe(0);
  });
  it('scores type + color + size + recency without colonia', () => {
    const result = scoreMatch(base.spotted, { ...base.missing, coloniaId: 'col-2' });
    expect(result.colonia).toBe(0);
    expect(result.total).toBe(70);
  });
  it('handles null color gracefully — 0 pts, no crash', () => {
    const result = scoreMatch({ ...base.spotted, color: null }, { ...base.missing, color: null });
    expect(result.color).toBe(0);
    expect(result.total).toBeGreaterThan(0);
  });
  it('recency: 0 pts when sighting is > 30 days from lastSeenAt', () => {
    expect(scoreMatch({ ...base.spotted, createdAt: new Date('2025-01-01') }, base.missing).recency).toBe(0);
  });
  it('recency: 10 pts within 30 days', () => {
    const recent = new Date(NOW.getTime() - 10 * 86_400_000);
    expect(scoreMatch({ ...base.spotted, createdAt: recent }, base.missing).recency).toBe(10);
  });
});
