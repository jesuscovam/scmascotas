import { PetsService, ColoniasService } from '@scmascotas/services';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ url }) => {
  const tipo = url.searchParams.get('tipo');
  const coloniaId = url.searchParams.get('colonia') ?? undefined;
  const type = tipo === 'dog' || tipo === 'cat' || tipo === 'other' ? tipo : undefined;

  const [pets, colonias] = await Promise.all([
    PetsService.listActive({ type, coloniaId }),
    ColoniasService.list()
  ]);

  return { pets, colonias, filterType: type ?? '', filterColonia: coloniaId ?? '' };
};
