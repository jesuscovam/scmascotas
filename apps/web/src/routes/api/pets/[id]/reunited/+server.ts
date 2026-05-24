import { json, error } from '@sveltejs/kit';
import { PetsService } from '@scmascotas/services';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = async ({ request, params, locals }) => {
  const body = await request.json().catch(() => ({}));
  const editToken = typeof body.editToken === 'string' ? body.editToken : undefined;

  try {
    await PetsService.markReunited(params.id, {
      actorUserId: locals.user?.id,
      editToken
    });
  } catch (e) {
    const msg = e instanceof Error ? e.message : '';
    if (msg === 'NOT_FOUND') throw error(404, 'Mascota no encontrada');
    if (msg === 'FORBIDDEN') throw error(403, 'No tienes permiso para editar este reporte');
    throw error(500, 'Error al actualizar el reporte');
  }

  return json({ ok: true });
};
