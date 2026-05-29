import { PetsService, SpottedPetsService, fuzz } from '@scmascotas/services';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params, locals }) => {
	const pet = await PetsService.getBySlug(params.slug);
	if (!pet) throw error(404, 'Mascota no encontrada');

	// Privacy: only `precise` precision needs fuzzing — `colonia` rows already
	// reflect an approximate centroid and `unknown` has null coords. Same rule
	// as /api/pets/map so a pet's pin on the detail page matches the one on
	// the marquee map.
	const publicPet =
		pet.locationPrecision === 'precise' && pet.lat != null && pet.lng != null
			? { ...pet, ...fuzz({ lat: pet.lat, lng: pet.lng }, pet.id) }
			: pet;

	const sightings = await SpottedPetsService.listForPet(pet.id);
	return { pet: publicPet, sightings, user: locals.user ?? null };
};
