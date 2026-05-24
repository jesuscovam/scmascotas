import { SpottedPetsService } from '@scmascotas/services';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const sighting = await SpottedPetsService.getBySlug(params.slug);
	if (!sighting) throw error(404, 'Avistamiento no encontrado');
	return { sighting };
};
