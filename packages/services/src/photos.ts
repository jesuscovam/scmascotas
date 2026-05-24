import { put } from '@vercel/blob';
import { db, petPhotos } from '@scmascotas/db';
import { eq } from 'drizzle-orm';
import { EmbeddingsService } from './embeddings.js';

export const PhotosService = {
  async upload(petId: string, file: File, isPrimary = false, blobToken?: string, replicateToken?: string) {
    const blob = await put(`pets/${petId}/${file.name}`, file, { access: 'public', ...(blobToken ? { token: blobToken } : {}) });
    const [photo] = await db
      .insert(petPhotos)
      .values({ petId, url: blob.url, isPrimary })
      .returning();

    // Fire-and-forget: embed after the row is saved; don't block the response
    const photoId = photo.id;
    EmbeddingsService.generate(blob.url, replicateToken)
      .then((embedding) => {
        if (!embedding) return;
        return db
          .update(petPhotos)
          .set({ embedding })
          .where(eq(petPhotos.id, photoId));
      })
      .catch((err) => console.error('[embeddings] pet photo failed, id=', photoId, err));

    return photo;
  },
};
