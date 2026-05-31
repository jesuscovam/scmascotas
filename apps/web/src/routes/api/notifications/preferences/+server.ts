import { json, error } from '@sveltejs/kit';
import { NotificationsService } from '@scmascotas/services';
import { notificationPreferencesSchema } from '@scmascotas/schemas';
import type { RequestHandler } from './$types';

// PATCH /api/notifications/preferences — update channel toggles
export const PATCH: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Debes iniciar sesión');

	const body = await request.json().catch(() => null);
	const parsed = notificationPreferencesSchema.safeParse(body);
	if (!parsed.success) throw error(400, 'Preferencias inválidas');

	const updated = await NotificationsService.updatePreferences(locals.user.id, {
		channelEmail: parsed.data.channelEmail,
	});
	return json({ ok: true, channelEmail: updated.channelEmail });
};
