import { describe, it, expect } from 'vitest';
import { cosineSimilarity, visualScore } from './cosine.js';

describe('cosineSimilarity', () => {
  it('identical vectors return 1.0', () => {
    const v = [1, 0, 0, 0];
    expect(cosineSimilarity(v, v)).toBeCloseTo(1.0);
  });

  it('orthogonal vectors return 0.0', () => {
    expect(cosineSimilarity([1, 0], [0, 1])).toBeCloseTo(0.0);
  });

  it('opposite vectors return -1.0', () => {
    expect(cosineSimilarity([1, 0], [-1, 0])).toBeCloseTo(-1.0);
  });

  it('zero vector returns 0 — no NaN', () => {
    expect(cosineSimilarity([0, 0], [1, 1])).toBe(0);
    expect(cosineSimilarity([0, 0], [0, 0])).toBe(0);
  });

  it('normalised float vectors yield similarity < 1.0 but close', () => {
    const a = [0.6, 0.8];
    const b = [0.8, 0.6];
    const sim = cosineSimilarity(a, b);
    expect(sim).toBeGreaterThan(0.9);
    expect(sim).toBeLessThan(1.0);
  });
});

describe('visualScore', () => {
  it('similarity >= 0.92 returns 60 — idéntica', () => {
    expect(visualScore(0.95)).toBe(60);
    expect(visualScore(0.92)).toBe(60);
  });

  it('similarity 0.85–0.91 returns 45 — muy similar', () => {
    expect(visualScore(0.91)).toBe(45);
    expect(visualScore(0.85)).toBe(45);
  });

  it('similarity 0.78–0.84 returns 25 — parecido', () => {
    expect(visualScore(0.84)).toBe(25);
    expect(visualScore(0.78)).toBe(25);
  });

  it('similarity 0.70–0.77 returns 10 — weak (no badge)', () => {
    expect(visualScore(0.77)).toBe(10);
    expect(visualScore(0.70)).toBe(10);
  });

  it('similarity below 0.70 returns 0', () => {
    expect(visualScore(0.69)).toBe(0);
    expect(visualScore(0.60)).toBe(0);
    expect(visualScore(0.0)).toBe(0);
    expect(visualScore(-0.5)).toBe(0);
  });
});
