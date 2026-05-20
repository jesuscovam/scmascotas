import { PetsService } from '@scmascotas/services';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const pet = await PetsService.getBySlug(params.slug);
	if (!pet) throw error(404, 'Mascota no encontrada');
	if (pet.status !== 'missing') throw error(410, 'Este reporte ya no está activo');
	return { pet };
};
