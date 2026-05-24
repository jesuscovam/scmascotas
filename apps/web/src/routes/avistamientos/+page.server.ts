import { SpottedPetsService, ColoniasService } from '@scmascotas/services';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
	const tipo = url.searchParams.get('tipo') ?? undefined;
	const colonia = url.searchParams.get('colonia') ?? undefined;
	const type = tipo === 'dog' || tipo === 'cat' || tipo === 'other' ? tipo : undefined;
	const [sightings, colonias] = await Promise.all([
		SpottedPetsService.listAll({ type, coloniaId: colonia }),
		ColoniasService.list()
	]);
	return { sightings, colonias, filterType: tipo ?? '', filterColonia: colonia ?? '' };
};
