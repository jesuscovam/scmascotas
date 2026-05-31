import { json, error } from '@sveltejs/kit';
import { NotificationsService } from '@scmascotas/services';
import { setPetNotifyLevelSchema } from '@scmascotas/schemas';
import type { RequestHandler } from './$types';

// PATCH /api/pets/[id]/notify-level — set per-pet alert aggressiveness (owner only)
export const PATCH: RequestHandler = async ({ request, params, locals }) => {
	if (!locals.user) throw error(401, 'Debes iniciar sesión');

	const body = await request.json().catch(() => null);
	const parsed = setPetNotifyLevelSchema.safeParse(body);
	if (!parsed.success) throw error(400, 'Nivel de notificación inválido');

	try {
		await NotificationsService.setPetNotifyLevel(params.id, parsed.data.level, {
			actorUserId: locals.user.id,
		});
	} catch (e) {
		const msg = e instanceof Error ? e.message : '';
		if (msg === 'NOT_FOUND') throw error(404, 'Mascota no encontrada');
		if (msg === 'FORBIDDEN') throw error(403, 'No tienes permiso para modificar este reporte');
		throw error(500, 'Error al actualizar la preferencia');
	}

	return json({ ok: true, level: parsed.data.level });
};
