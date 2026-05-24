import { json, error } from '@sveltejs/kit';
import { PetsService } from '@scmascotas/services';
import type { RequestHandler } from './$types';

// PATCH /api/pets/[id]/archive
// Body: { archived: boolean }
export const PATCH: RequestHandler = async ({ request, params, locals }) => {
	if (!locals.user) throw error(401, 'Debes iniciar sesión');

	const body = await request.json().catch(() => ({}));
	const archive = body.archived;
	if (typeof archive !== 'boolean') throw error(400, '`archived` (boolean) is required');

	try {
		if (archive) {
			await PetsService.markArchived(params.id, { actorUserId: locals.user.id });
		} else {
			await PetsService.markActive(params.id, { actorUserId: locals.user.id });
		}
	} catch (e) {
		const msg = e instanceof Error ? e.message : '';
		if (msg === 'NOT_FOUND') throw error(404, 'Mascota no encontrada');
		if (msg === 'FORBIDDEN') throw error(403, 'No tienes permiso para modificar este reporte');
		throw error(500, 'Error al actualizar el reporte');
	}

	return json({ ok: true });
};
