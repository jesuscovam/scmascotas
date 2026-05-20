import { json, error } from '@sveltejs/kit';
import { SightingsService } from '@scmascotas/services';
import { createSightingSchema } from '@scmascotas/schemas';
import { checkLimit } from '$lib/server/rate-limit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params, locals }) => {
  const body = await request.json();
  const parsed = createSightingSchema.safeParse(body);
  if (!parsed.success) throw error(400, parsed.error.message);

  const forwarded = request.headers.get('x-forwarded-for') ?? '';
  const ip = forwarded.split(',')[0].trim();
  const ipHash = ip ? Buffer.from(ip).toString('base64') : undefined;

  if (!await checkLimit('create_sighting', ipHash)) {
    throw error(429, 'Demasiados avistamientos. Intenta de nuevo más tarde.');
  }

  const sighting = await SightingsService.create(params.id, parsed.data, {
    ipHash,
    userId: locals.user?.id
  });

  return json(sighting, { status: 201 });
};
