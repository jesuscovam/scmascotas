import { json, error } from '@sveltejs/kit';
import { PetsService } from '@scmascotas/services';
import { createMissingPetSchema } from '@scmascotas/schemas';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request }) => {
  const body = await request.json();
  const parsed = createMissingPetSchema.safeParse(body);

  if (!parsed.success) {
    throw error(400, parsed.error.message);
  }

  const forwarded = request.headers.get('x-forwarded-for') ?? '';
  const ip = forwarded.split(',')[0].trim();
  const ipHash = ip
    ? Buffer.from(ip).toString('base64')
    : undefined;

  const pet = await PetsService.create(parsed.data, ipHash);
  return json({ slug: pet.slug, editToken: pet.editToken }, { status: 201 });
};
