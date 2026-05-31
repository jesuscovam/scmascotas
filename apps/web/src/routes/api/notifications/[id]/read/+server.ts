import { json, error } from '@sveltejs/kit';
import { NotificationsService } from '@scmascotas/services';
import type { RequestHandler } from './$types';

// POST /api/notifications/[id]/read — mark one notification read
export const POST: RequestHandler = async ({ params, locals }) => {
	if (!locals.user) throw error(401, 'Debes iniciar sesión');
	await NotificationsService.markRead(params.id, locals.user.id);
	return json({ ok: true });
};
