import { requireAuth } from '$lib/server/auth-guards';
import { SpottedPetsService } from '@scmascotas/services';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
	requireAuth(locals);
	const sightings = await SpottedPetsService.listByUser(locals.user.id);
	return { user: locals.user, sightings };
};
