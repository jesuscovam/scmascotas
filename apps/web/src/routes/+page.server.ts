export const config = { runtime: 'edge' };

import { PetsService } from '@scmascotas/services';

export async function load() {
  const pets = await PetsService.listActive();
  return { pets };
}
