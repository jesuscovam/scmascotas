import { db, pets, petPhotos, colonias } from '@scmascotas/db';
import { eq, desc } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import type { CreateMissingPet } from '@scmascotas/schemas';

function generateSlug(name: string | null | undefined): string {
  const base = (name ?? 'mascota')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `${base}-${randomBytes(4).toString('hex')}`;
}

export const PetsService = {
  async listActive() {
    return db
      .select({
        id: pets.id,
        slug: pets.slug,
        name: pets.name,
        type: pets.type,
        color: pets.color,
        size: pets.size,
        lastSeenAt: pets.lastSeenAt,
        colonia: colonias.name,
        status: pets.status
      })
      .from(pets)
      .leftJoin(colonias, eq(pets.coloniaId, colonias.id))
      .where(eq(pets.status, 'missing'))
      .orderBy(desc(pets.createdAt));
  },

  async getBySlug(slug: string) {
    const [pet] = await db
      .select()
      .from(pets)
      .leftJoin(colonias, eq(pets.coloniaId, colonias.id))
      .where(eq(pets.slug, slug))
      .limit(1);

    if (!pet) return null;

    const photos = await db
      .select()
      .from(petPhotos)
      .where(eq(petPhotos.petId, pet.pets.id))
      .orderBy(desc(petPhotos.isPrimary));

    return { ...pet.pets, colonia: pet.colonias?.name ?? null, photos };
  },

  async create(data: CreateMissingPet, { ipHash, userId }: { ipHash?: string; userId?: string } = {}) {
    const slug = generateSlug(data.name);
    const editToken = randomBytes(16).toString('hex');

    const [pet] = await db
      .insert(pets)
      .values({
        slug,
        editToken,
        type: data.species === 'other' ? 'other' : data.species,
        name: data.name,
        description: data.description,
        coloniaId: data.colonia_id,
        lastSeenAt: data.last_seen_at,
        color: data.color,
        sex: data.sex,
        size: data.size,
        breed: data.breed,
        contactWhatsapp: data.contact_whatsapp,
        contactName: data.contact_name,
        anonymous: String(data.anonymous),
        reporterIpHash: ipHash,
        reporterUserId: userId
      })
      .returning();

    return { ...pet, editToken };
  },

  async listByUser(userId: string) {
    return db
      .select({
        id: pets.id,
        slug: pets.slug,
        name: pets.name,
        type: pets.type,
        color: pets.color,
        size: pets.size,
        status: pets.status,
        lastSeenAt: pets.lastSeenAt,
        colonia: colonias.name,
        createdAt: pets.createdAt
      })
      .from(pets)
      .leftJoin(colonias, eq(pets.coloniaId, colonias.id))
      .where(eq(pets.reporterUserId, userId))
      .orderBy(desc(pets.createdAt));
  },

  async findByEditToken(editToken: string) {
    const [pet] = await db.select().from(pets).where(eq(pets.editToken, editToken)).limit(1);
    return pet ?? null;
  },

  async claim(petId: string, { editToken, userId }: { editToken: string; userId: string }) {
    const [pet] = await db.select().from(pets).where(eq(pets.id, petId)).limit(1);
    if (!pet || pet.editToken !== editToken) return { ok: false as const, error: 'invalid_token' };
    await db.update(pets).set({ reporterUserId: userId }).where(eq(pets.id, petId));
    return { ok: true as const };
  }
};
