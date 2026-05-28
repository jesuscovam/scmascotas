import { describe, it, expect } from 'vitest';
import {
  fuzz,
  googleMapsUrl,
  googleMapsDirectionsUrl,
  appleMapsUrl,
  haversineMeters
} from './location.js';

const CENTRO = { lat: 16.737, lng: -92.6376 };

describe('fuzz', () => {
  it('is deterministic for the same seed', () => {
    const a = fuzz(CENTRO, 'pet-abc-123');
    const b = fuzz(CENTRO, 'pet-abc-123');
    expect(a).toEqual(b);
  });

  it('different seeds produce different points', () => {
    const a = fuzz(CENTRO, 'pet-abc-123');
    const b = fuzz(CENTRO, 'pet-xyz-456');
    expect(a).not.toEqual(b);
  });

  it('stays within the requested radius (150m default)', () => {
    for (const seed of ['a', 'pet-1', 'pet-2', 'long-seed-string-here', '🐶']) {
      const fuzzed = fuzz(CENTRO, seed);
      expect(haversineMeters(CENTRO, fuzzed)).toBeLessThanOrEqual(150);
    }
  });

  it('respects a custom radius', () => {
    for (const seed of ['a', 'b', 'c', 'd', 'e']) {
      const fuzzed = fuzz(CENTRO, seed, 50);
      expect(haversineMeters(CENTRO, fuzzed)).toBeLessThanOrEqual(50);
    }
  });

  it('distributes points across the disk (not all clumped at center)', () => {
    const points = Array.from({ length: 50 }, (_, i) => fuzz(CENTRO, `pet-${i}`));
    const distances = points.map((p) => haversineMeters(CENTRO, p));
    const avg = distances.reduce((s, d) => s + d, 0) / distances.length;
    // For uniform-by-area, average distance is (2/3) * radius ≈ 100m for 150m radius.
    expect(avg).toBeGreaterThan(60);
    expect(avg).toBeLessThan(140);
  });
});

describe('googleMapsUrl', () => {
  it('formats a maps.google.com query URL', () => {
    expect(googleMapsUrl(16.737, -92.6376)).toBe(
      'https://www.google.com/maps?q=16.737000,-92.637600'
    );
  });

  it('handles southern / eastern hemispheres', () => {
    expect(googleMapsUrl(-34.6037, -58.3816)).toContain('q=-34.603700,-58.381600');
  });
});

describe('googleMapsDirectionsUrl', () => {
  it('produces a directions deep-link', () => {
    expect(googleMapsDirectionsUrl(16.737, -92.6376)).toBe(
      'https://www.google.com/maps/dir/?api=1&destination=16.737000,-92.637600'
    );
  });
});

describe('appleMapsUrl', () => {
  it('formats an Apple Maps URL', () => {
    expect(appleMapsUrl(16.737, -92.6376)).toBe(
      'https://maps.apple.com/?q=16.737000,-92.637600'
    );
  });
});

describe('haversineMeters', () => {
  it('returns 0 for identical points', () => {
    expect(haversineMeters(CENTRO, CENTRO)).toBe(0);
  });

  it('matches known distance: San Cristóbal centro ↔ Tuxtla Gutiérrez ≈ 50km', () => {
    const tuxtla = { lat: 16.7531, lng: -93.1153 };
    const meters = haversineMeters(CENTRO, tuxtla);
    expect(meters).toBeGreaterThan(48_000);
    expect(meters).toBeLessThan(52_000);
  });

  it('is symmetric', () => {
    const a = { lat: 16.737, lng: -92.6376 };
    const b = { lat: 16.744, lng: -92.6275 };
    expect(haversineMeters(a, b)).toBeCloseTo(haversineMeters(b, a), 4);
  });
});
