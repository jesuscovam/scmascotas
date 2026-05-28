/**
 * Cosine similarity between two equal-length float vectors.
 * Returns 0 if either vector has zero magnitude (guards against NaN).
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) throw new Error('Vectors must have equal length');
  let dot = 0, magA = 0, magB = 0;
  for (let i = 0; i < a.length; i++) {
    dot  += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  const denom = Math.sqrt(magA) * Math.sqrt(magB);
  if (denom === 0) return 0;
  return dot / denom;
}

/**
 * Convert CLIP cosine similarity into a 0–60 point bonus.
 *
 * Tiers tuned to be conservative: CLIP ViT-L/14 routinely returns 0.6–0.7
 * cosines between two different cats in similar poses, so the badge floor
 * is 0.78 ("Parecido") and only 0.92+ earns the "Imagen idéntica" payout.
 *
 * Recalibrate once we have ~50 labeled human_verdict rows.
 */
export function visualScore(sim: number): number {
  if (sim >= 0.92) return 60;
  if (sim >= 0.85) return 45;
  if (sim >= 0.78) return 25;
  if (sim >= 0.70) return 10;
  return 0;
}
