import { env } from '$env/dynamic/private';
import type { ServerLoad } from '@sveltejs/kit';

export const load: ServerLoad = async ({ locals }) => {
	return {
		isProduction: env.VERCEL_ENV === 'production',
		user: locals.user
			? {
					id: locals.user.id,
					name: locals.user.name,
					email: locals.user.email,
					image: locals.user.image ?? null
				}
			: null
	};
};
