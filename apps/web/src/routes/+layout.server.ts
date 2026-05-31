import type { ServerLoad } from '@sveltejs/kit';
import { NotificationsService } from '@scmascotas/services';

export const load: ServerLoad = async ({ locals }) => {
	if (!locals.user) {
		return { user: null, notifications: [], unreadCount: 0 };
	}

	const [recent, unreadCount] = await Promise.all([
		NotificationsService.list(locals.user.id, { limit: 8 }),
		NotificationsService.unreadCount(locals.user.id)
	]);

	return {
		user: {
			id: locals.user.id,
			name: locals.user.name,
			email: locals.user.email,
			image: locals.user.image ?? null
		},
		notifications: recent.map((n) => ({
			id: n.id,
			type: n.type,
			title: n.title,
			body: n.body,
			url: n.url,
			readAt: n.readAt,
			createdAt: n.createdAt
		})),
		unreadCount
	};
};
