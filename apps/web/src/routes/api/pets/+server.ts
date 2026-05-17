import { json, error } from '@sveltejs/kit';
import { PetsService } from '@scmascotas/services';
import { createMissingPetSchema } from '@scmascotas/schemas';
import { checkLimit } from '$lib/server/rate-limit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
  const body = await request.json();
  const parsed = createMissingPetSchema.safeParse(body);

  if (!parsed.success) {
    throw error(400, parsed.error.message);
  }

  const forwarded = request.headers.get('x-forwarded-for') ?? '';
  const ip = forwarded.split(',')[0].trim();
  const ipHash = ip ? Buffer.from(ip).toString('base64') : undefined;

  if (!await checkLimit('create_pet', ipHash)) {
    throw error(429, 'Demasiados reportes. Intenta de nuevo mañana.');
  }

  const pet = await PetsService.create(parsed.data, { ipHash, userId: locals.user?.id });
  return json({ slug: pet.slug, editToken: pet.editToken }, { status: 201 });
};
