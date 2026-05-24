import { json, error } from '@sveltejs/kit';
import { SpottedPetsService } from '@scmascotas/services';
import type { RequestHandler } from './$types';

// PATCH /api/spotted-pets/[id]/archive
// Body: { archived: boolean }
export const PATCH: RequestHandler = async ({ request, params, locals }) => {
	if (!locals.user) throw error(401, 'Debes iniciar sesión');

	const body = await request.json().catch(() => ({}));
	const archive = body.archived;
	if (typeof archive !== 'boolean') throw error(400, '`archived` (boolean) is required');

	try {
		if (archive) {
			await SpottedPetsService.archive(params.id, locals.user.id);
		} else {
			await SpottedPetsService.unarchive(params.id, locals.user.id);
		}
	} catch (e) {
		const msg = e instanceof Error ? e.message : '';
		if (msg === 'NOT_FOUND') throw error(404, 'Avistamiento no encontrado');
		if (msg === 'FORBIDDEN') throw error(403, 'No tienes permiso para modificar este avistamiento');
		throw error(500, 'Error al actualizar el avistamiento');
	}

	return json({ ok: true });
};
