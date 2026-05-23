import { PetsService, ColoniasService } from '@scmascotas/services';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const [allPets, colonias] = await Promise.all([
		PetsService.listActiveForMatching(),
		ColoniasService.list()
	]);
	return { allPets, colonias };
};
