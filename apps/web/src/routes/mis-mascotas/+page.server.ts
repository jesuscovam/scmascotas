import { requireAuth } from '$lib/server/auth-guards';
import { PetsService } from '@scmascotas/services';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
	requireAuth(locals);
	const pets = await PetsService.listByUser(locals.user.id);
	return { user: locals.user, pets };
};
