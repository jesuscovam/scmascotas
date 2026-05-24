import { PetsService, ColoniasService, SpottedPetsService } from '@scmascotas/services';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [pets, sightings, colonias] = await Promise.all([
		PetsService.listActiveForMatching(), // includes photoUrl
		SpottedPetsService.listAll(),
		ColoniasService.list()
	]);
	return { pets, sightings, colonias };
};
