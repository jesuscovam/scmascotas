import { PetsService } from '@scmascotas/services';
import { ColoniasService } from '@scmascotas/services';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const pet = await PetsService.getBySlug(params.slug);
	if (!pet) throw error(404, 'Mascota no encontrada');
	const colonias = await ColoniasService.list();
	return { pet, colonias, user: locals.user ?? null };
};
