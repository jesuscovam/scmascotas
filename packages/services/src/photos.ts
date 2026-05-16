import { put } from '@vercel/blob';
import { db, petPhotos } from '@scmascotas/db';

export const PhotosService = {
  async upload(petId: string, file: File, isPrimary = false) {
    const blob = await put(`pets/${petId}/${file.name}`, file, { access: 'public' });
    const [photo] = await db
      .insert(petPhotos)
      .values({ petId, url: blob.url, isPrimary })
      .returning();
    return photo;
  }
};
