import { json, error } from '@sveltejs/kit';
import { SpottedPetsService } from '@scmascotas/services';
import { createSpottedPetSchema } from '@scmascotas/schemas';
import { checkLimit } from '$lib/server/rate-limit';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, locals }) => {
	const forwarded = request.headers.get('x-forwarded-for') ?? '';
	const ip = forwarded.split(',')[0].trim();
	const ipHash = ip ? Buffer.from(ip).toString('base64') : undefined;

	if (!(await checkLimit('create_spotted_pet', ipHash))) {
		throw error(429, 'Demasiados reportes. Intenta de nuevo mañana.');
	}

	const body = await request.json();
	const parsed = createSpottedPetSchema.safeParse(body);
	if (!parsed.success) {
		throw error(400, parsed.error.issues[0]?.message ?? 'Datos inválidos.');
	}

	const record = await SpottedPetsService.create(parsed.data, {
		ipHash,
		userId: locals.user?.id,
	});

	return json(record, { status: 201 });
};
