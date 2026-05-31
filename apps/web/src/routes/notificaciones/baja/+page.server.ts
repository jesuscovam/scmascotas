import { NotificationsService } from '@scmascotas/services';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ url }) => {
	const token = url.searchParams.get('token');
	if (!token) return { ok: false };
	const ok = await NotificationsService.unsubscribeByToken(token);
	return { ok };
};
