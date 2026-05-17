export const config = { runtime: 'edge' };
import { json, error } from '@sveltejs/kit';
import { PetsService } from '@scmascotas/services';
import type { RequestHandler } from '@sveltejs/kit';

export const POST: RequestHandler = async ({ request, locals }) => {
	if (!locals.user) throw error(401, 'Debes iniciar sesión');

	const { editToken } = await request.json();
	if (!editToken || typeof editToken !== 'string') throw error(400, 'Token requerido');

	const pet = await PetsService.findByEditToken(editToken);
	if (!pet) throw error(404, JSON.stringify({ message: 'Token inválido o reporte no encontrado' }));
	if (pet.reporterUserId) throw error(409, JSON.stringify({ message: 'Este reporte ya tiene dueño' }));

	const result = await PetsService.claim(pet.id, { editToken, userId: locals.user.id });
	if (!result.ok) throw error(400, JSON.stringify({ message: 'No se pudo reclamar el reporte' }));

	return json({ ok: true });
};
