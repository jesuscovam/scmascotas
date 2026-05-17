import { redirect } from '@sveltejs/kit';
import { env } from '$env/dynamic/private';

export async function load() {
	if (env.VERCEL_ENV === 'production') {
		redirect(302, '/');
	}
}
