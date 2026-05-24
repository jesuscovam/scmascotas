import { json } from '@sveltejs/kit';
import { PetsService } from '@scmascotas/services';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ url }) => {
	const coloniaId = url.searchParams.get('coloniaId') ?? undefined;
	const typeParam = url.searchParams.get('type');
	const type =
		typeParam === 'dog' || typeParam === 'cat' || typeParam === 'other' ? typeParam : undefined;

	const pets = await PetsService.listActiveForMatching({ coloniaId, type });
	return json(pets);
};
