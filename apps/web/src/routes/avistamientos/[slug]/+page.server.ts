import { SpottedPetsService, MatchesService } from '@scmascotas/services';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const sighting = await SpottedPetsService.getBySlug(params.slug);
	if (!sighting) throw error(404, 'Avistamiento no encontrado');

	// Only compute matches for open sightings not yet manually linked to a pet
	const matches = sighting.status === 'open' && !sighting.matchedPetId
		? await MatchesService.getMatchesFor(sighting.id)
		: [];

	return { sighting, matches };
};
