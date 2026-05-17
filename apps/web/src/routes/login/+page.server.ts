import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
	if (locals.user) redirect(302, '/mis-mascotas');
	return {
		hasGoogle: !!(env.GOOGLE_CLIENT_ID && env.GOOGLE_CLIENT_SECRET)
	};
};
