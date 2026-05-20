import { json, error } from '@sveltejs/kit';
import { PetsService } from '@scmascotas/services';
import { updatePetSchema } from '@scmascotas/schemas';
import type { RequestHandler } from './$types';

export const PATCH: RequestHandler = async ({ request, params, locals }) => {
  const body = await request.json();
  const parsed = updatePetSchema.safeParse(body);
  if (!parsed.success) throw error(400, parsed.error.message);

  const { editToken, ...data } = parsed.data;

  try {
    await PetsService.update(params.id, data, {
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
