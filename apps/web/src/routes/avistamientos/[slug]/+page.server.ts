import { SpottedPetsService, MatchesService, fuzz } from '@scmascotas/services';
import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ params }) => {
	const sighting = await SpottedPetsService.getBySlug(params.slug);
	if (!sighting) throw error(404, 'Avistamiento no encontrado');

	// Same privacy rule as /api/spotted-pets/map: only `precise` rows get fuzzed.
	// `colonia`-precision rows already reflect an approximate centroid.
	const publicSighting =
		sighting.locationPrecision === 'precise' && sighting.lat != null && sighting.lng != null
			? { ...sighting, ...fuzz({ lat: sighting.lat, lng: sighting.lng }, sighting.id) }
			: sighting;

	// Only compute matches for open sightings not yet manually linked to a pet
	const matches = sighting.status === 'open' && !sighting.matchedPetId
		? await MatchesService.getMatchesFor(sighting.id)
		: [];

	return { sighting: publicSighting, matches };
};
