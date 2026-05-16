import { json, error } from '@sveltejs/kit';
import { PhotosService } from '@scmascotas/services';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
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
  const photo = await PhotosService.upload(petId, file, isPrimary);
  return json(photo, { status: 201 });
};
