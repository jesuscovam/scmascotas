import { redirect } from '@sveltejs/kit';

export function requireAuth(locals: App.Locals): asserts locals is App.Locals & { user: NonNullable<App.Locals['user']> } {
	if (!locals.user) redirect(302, '/login');
}
