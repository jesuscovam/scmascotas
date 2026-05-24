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
 * Convert cosine similarity [−1, 1] to a 0–20 point bonus.
 * Thresholds tuned for CLIP ViT-L/14 embeddings of real pet photos.
 * Calibrate further once human_verdict data is available.
 */
export function visualScore(sim: number): number {
  if (sim >= 0.90) return 20;
  if (sim >= 0.80) return 15;
  if (sim >= 0.70) return 10;
  if (sim >= 0.60) return 5;
  return 0;
}
