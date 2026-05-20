import { db, sightings, pets } from '@scmascotas/db';
import { eq, desc } from 'drizzle-orm';
import type { CreateSighting } from '@scmascotas/schemas';

export const SightingsService = {
  async create(
    petId: string,
    data: CreateSighting,
    ctx: { ipHash?: string; userId?: string } = {}
  ) {
    const [sighting] = await db
      .insert(sightings)
      .values({
        petId,
        description: data.description,
        colonia: data.colonia,
        reporterIpHash: ctx.ipHash,
        reporterUserId: ctx.userId
      })
      .returning();

    await db
      .update(pets)
      .set({ lastSeenAt: new Date(), updatedAt: new Date() })
      .where(eq(pets.id, petId));

    return sighting;
  },

  async listForPet(petId: string) {
    return db
      .select()
      .from(sightings)
      .where(eq(sightings.petId, petId))
      .orderBy(desc(sightings.createdAt))
      .limit(20);
  }
};
