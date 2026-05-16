import { env } from '$env/dynamic/private';

export async function load() {
	return {
		isProduction: env.VERCEL_ENV === 'production'
	};
}
