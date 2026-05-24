import { json, error } from '@sveltejs/kit';
import { PhotosService } from '@scmascotas/services';
import { checkLimit } from '$lib/server/rate-limit';
import { BLOB_READ_WRITE_TOKEN, REPLICATE_API_TOKEN } from '$env/static/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const forwarded = request.headers.get('x-forwarded-for') ?? '';
  const ip = forwarded.split(',')[0].trim();
  const ipHash = ip ? Buffer.from(ip).toString('base64') : undefined;

  if (!await checkLimit('upload_photo', ipHash)) {
    throw error(429, 'Límite de fotos alcanzado. Intenta de nuevo mañana.');
  }

  const form = await request.formData();
  const petId = form.get('petId');
  const file = form.get('file');

  if (typeof petId !== 'string' || !petId) {
    throw error(400, 'petId is required');
  }
  if (!(file instanceof File)) {
    throw error(400, 'file is required');
  }

  const isPrimary = form.get('isPrimary') === 'true';
  const photo = await PhotosService.upload(petId, file, isPrimary, BLOB_READ_WRITE_TOKEN, REPLICATE_API_TOKEN);
  return json(photo, { status: 201 });
};
