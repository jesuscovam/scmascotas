import { ColoniasService } from '@scmascotas/services';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async () => {
	const colonias = await ColoniasService.list();
	return { colonias };
};
