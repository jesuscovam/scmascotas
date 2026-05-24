import { PetsService, SpottedPetsService } from '@scmascotas/services';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const pet = await PetsService.getBySlug(params.slug);
	if (!pet) throw error(404, 'Mascota no encontrada');
	const sightings = await SpottedPetsService.listForPet(pet.id);
	return { pet, sightings, user: locals.user ?? null };
};
