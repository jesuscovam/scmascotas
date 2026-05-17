import { requireAuth } from '$lib/server/auth-guards';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
	requireAuth(locals);
	return { user: locals.user };
};
