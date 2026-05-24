import { PetsService, ColoniasService, SpottedPetsService } from '@scmascotas/services';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const tipo = url.searchParams.get('tipo') ?? undefined;
	const colonia = url.searchParams.get('colonia') ?? undefined;
	const type = tipo === 'dog' || tipo === 'cat' || tipo === 'other' ? tipo : undefined;

	const [pets, sightings, colonias] = await Promise.all([
		PetsService.listActiveForMatching({ type, coloniaId: colonia }),
		SpottedPetsService.listAll(),
		ColoniasService.list()
	]);

	return { pets, sightings, colonias, filterType: tipo ?? '', filterColonia: colonia ?? '' };
};
