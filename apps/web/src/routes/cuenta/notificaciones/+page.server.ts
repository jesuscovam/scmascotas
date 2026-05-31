import { requireAuth } from '$lib/server/auth-guards';
import { NotificationsService } from '@scmascotas/services';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
	requireAuth(locals);
	const userId = locals.user.id;

	const [list, prefs] = await Promise.all([
		NotificationsService.list(userId, { limit: 50 }),
		NotificationsService.getPreferences(userId)
	]);

	return {
		emailVerified: locals.user.emailVerified ?? false,
		channelEmail: prefs?.channelEmail ?? true,
		notifications: list.map((n) => ({
			id: n.id,
			type: n.type,
			title: n.title,
			body: n.body,
			url: n.url,
			readAt: n.readAt,
			createdAt: n.createdAt
		}))
	};
};
