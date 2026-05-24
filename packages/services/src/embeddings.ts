import Replicate from 'replicate';

// CLIP ViT-L/14 via andreasjansson/clip-features on Replicate.
// Outputs one 768-dimensional embedding per image URL.
// Model: https://replicate.com/andreasjansson/clip-features
const CLIP_MODEL_VERSION =
  'andreasjansson/clip-features:75b33f253f7714a281ad3e9b28f63e3232d583716ef6718f2e46641077ea040a';

export const EmbeddingsService = {
  /**
   * Generate a 768-dim CLIP embedding for a public image URL.
   * Pass `token` explicitly from the SvelteKit route (via $env/static/private)
   * rather than relying on process.env, which Vite does not always populate.
   * Returns null on any error — callers treat null as "no embedding available".
   */
  async generate(imageUrl: string, token?: string): Promise<number[] | null> {
    try {
      const apiToken = token ?? process.env.REPLICATE_API_TOKEN;
      if (!apiToken) throw new Error('REPLICATE_API_TOKEN is not set');
      const replicate = new Replicate({ auth: apiToken });
      const output = (await replicate.run(CLIP_MODEL_VERSION, {
        input: { inputs: imageUrl },
      })) as Array<{ embedding: number[] }>;

      const embedding = output?.[0]?.embedding;
      if (!Array.isArray(embedding) || embedding.length !== 768) {
        console.warn('[embeddings] unexpected output shape', output);
        return null;
      }
      return embedding;
    } catch (err) {
      console.error('[embeddings] generate failed for', imageUrl, err);
      return null;
    }
  },
};
