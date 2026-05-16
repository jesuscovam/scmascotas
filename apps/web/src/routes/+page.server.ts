import { PetsService } from '@scpets/services';

export async function load() {
  const pets = await PetsService.listActive();
  return { pets };
}
