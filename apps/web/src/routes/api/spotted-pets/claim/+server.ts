import { json, error } from '@sveltejs/kit';
import { SpottedPetsService } from '@scmascotas/services';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Debes iniciar sesión');

	const { editToken } = await request.json();
	if (!editToken || typeof editToken !== 'string') throw error(400, 'Token requerido');

	const row = await SpottedPetsService.claim(editToken, locals.user.id);
	if (!row) {
		throw error(404, JSON.stringify({ message: 'Token inválido o avistamiento no encontrado' }));
	}

	return json({ ok: true });
};
