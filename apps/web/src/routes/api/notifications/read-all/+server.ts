import { json, error } from '@sveltejs/kit';
import { NotificationsService } from '@scmascotas/services';
import type { RequestHandler } from './$types';

// POST /api/notifications/read-all — mark all of the user's notifications read
export const POST: RequestHandler = async ({ locals }) => {
	if (!locals.user) throw error(401, 'Debes iniciar sesión');
	await NotificationsService.markAllRead(locals.user.id);
	return json({ ok: true });
};
