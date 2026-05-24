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
  it('similarity >= 0.90 returns 20', () => {
    expect(visualScore(0.95)).toBe(20);
    expect(visualScore(0.90)).toBe(20);
  });

  it('similarity 0.80–0.89 returns 15', () => {
    expect(visualScore(0.85)).toBe(15);
    expect(visualScore(0.80)).toBe(15);
  });

  it('similarity 0.70–0.79 returns 10', () => {
    expect(visualScore(0.75)).toBe(10);
    expect(visualScore(0.70)).toBe(10);
  });

  it('similarity 0.60–0.69 returns 5', () => {
    expect(visualScore(0.65)).toBe(5);
    expect(visualScore(0.60)).toBe(5);
  });

  it('similarity below 0.60 returns 0', () => {
    expect(visualScore(0.59)).toBe(0);
    expect(visualScore(0.0)).toBe(0);
    expect(visualScore(-0.5)).toBe(0);
  });
});
