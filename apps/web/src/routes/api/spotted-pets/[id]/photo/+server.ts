import { json, error } from '@sveltejs/kit';
import { SpottedPetsService } from '@scmascotas/services';
import { checkLimit } from '$lib/server/rate-limit';
import { BLOB_READ_WRITE_TOKEN } from '$env/static/private';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params }) => {
	const forwarded = request.headers.get('x-forwarded-for') ?? '';
	const ip = forwarded.split(',')[0].trim();
	const ipHash = ip ? Buffer.from(ip).toString('base64') : undefined;

	if (!(await checkLimit('upload_photo', ipHash))) {
		throw error(429, 'Límite de fotos alcanzado. Intenta de nuevo mañana.');
	}

	const form = await request.formData();
	const file = form.get('file');

	if (!(file instanceof File)) {
		throw error(400, 'file is required');
	}

	const url = await SpottedPetsService.uploadPhoto(params.id, file, BLOB_READ_WRITE_TOKEN);
	return json({ url }, { status: 201 });
};
