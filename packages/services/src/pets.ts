import { db, pets, petPhotos, colonias } from '@scmascotas/db';
import { eq, desc, and, sql } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import type { CreateMissingPet, UpdatePet } from '@scmascotas/schemas';

type ActorCtx = { actorUserId?: string; editToken?: string };

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
  async listActiveForMatching(opts: { type?: 'dog' | 'cat' | 'other'; coloniaId?: string } = {}) {
    const conditions = [eq(pets.status, 'missing')];
    if (opts.type) conditions.push(eq(pets.type, opts.type));
    if (opts.coloniaId) conditions.push(eq(pets.coloniaId, opts.coloniaId));

    return db
      .select({
        id: pets.id,
        slug: pets.slug,
        name: pets.name,
        type: pets.type,
        color: pets.color,
        size: pets.size,
        description: pets.description,
        lastSeenAt: pets.lastSeenAt,
        colonia: colonias.name,
        coloniaId: pets.coloniaId,
        photoUrl:  petPhotos.url,
        embedding: petPhotos.embedding,
        lat: sql<number | null>`ST_Y(${pets.location}::geometry)`.as('lat'),
        lng: sql<number | null>`ST_X(${pets.location}::geometry)`.as('lng'),
        locationPrecision: pets.locationPrecision,
      })
      .from(pets)
      .leftJoin(colonias, eq(pets.coloniaId, colonias.id))
      .leftJoin(petPhotos, and(eq(petPhotos.petId, pets.id), eq(petPhotos.isPrimary, true)))
      .where(and(...conditions))
      .orderBy(desc(pets.createdAt));
  },

  async listActive(opts: { type?: 'dog' | 'cat' | 'other'; coloniaId?: string } = {}) {
    const conditions = [eq(pets.status, 'missing')];
    if (opts.type) conditions.push(eq(pets.type, opts.type));
    if (opts.coloniaId) conditions.push(eq(pets.coloniaId, opts.coloniaId));

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
        coloniaId: pets.coloniaId,
        status: pets.status
      })
      .from(pets)
      .leftJoin(colonias, eq(pets.coloniaId, colonias.id))
      .where(and(...conditions))
      .orderBy(desc(pets.createdAt));
  },

  async getBySlug(slug: string) {
    // Explicit projection: skip the raw `location` column (PostGIS returns it
    // as hex EWKB which our custom Drizzle type can't parse) and use ST_X / ST_Y
    // to surface usable lat/lng instead.
    const [pet] = await db
      .select({
        id: pets.id,
        slug: pets.slug,
        type: pets.type,
        name: pets.name,
        description: pets.description,
        coloniaId: pets.coloniaId,
        lastSeenAt: pets.lastSeenAt,
        status: pets.status,
        color: pets.color,
        sex: pets.sex,
        size: pets.size,
        breed: pets.breed,
        contactWhatsapp: pets.contactWhatsapp,
        contactName: pets.contactName,
        anonymous: pets.anonymous,
        editToken: pets.editToken,
        reporterUserId: pets.reporterUserId,
        reunitedAt: pets.reunitedAt,
        createdAt: pets.createdAt,
        updatedAt: pets.updatedAt,
        locationPrecision: pets.locationPrecision,
        lat: sql<number | null>`ST_Y(${pets.location}::geometry)`.as('lat'),
        lng: sql<number | null>`ST_X(${pets.location}::geometry)`.as('lng'),
        colonia: colonias.name
      })
      .from(pets)
      .leftJoin(colonias, eq(pets.coloniaId, colonias.id))
      .where(eq(pets.slug, slug))
      .limit(1);

    if (!pet) return null;

    const photos = await db
      .select()
      .from(petPhotos)
      .where(eq(petPhotos.petId, pet.id))
      .orderBy(desc(petPhotos.isPrimary));

    return { ...pet, photos };
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
        reporterUserId: userId,
        location: data.location,
        locationPrecision: data.location ? 'precise' : 'unknown'
      })
      .returning();

    return { ...pet, editToken };
  },

  /**
   * Pets whose precise (server-side) location falls inside the given viewport,
   * returned with fuzzed coordinates for public display. Reporter exact addresses
   * never leave the server.
   */
  async listInBounds(opts: {
    north: number;
    south: number;
    east: number;
    west: number;
    status?: 'missing' | 'reunited' | 'archived';
    type?: 'dog' | 'cat' | 'other';
    since?: Date;
    limit?: number;
  }) {
    const { north, south, east, west, status = 'missing', type, since, limit = 500 } = opts;
    const conditions = [
      eq(pets.status, status),
      sql`${pets.location} IS NOT NULL`,
      sql`${pets.location} && ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326)::geography`
    ];
    if (type) conditions.push(eq(pets.type, type));
    if (since) conditions.push(sql`${pets.createdAt} >= ${since}`);

    return db
      .select({
        id: pets.id,
        slug: pets.slug,
        name: pets.name,
        type: pets.type,
        lat: sql<number>`ST_Y(${pets.location}::geometry)`.as('lat'),
        lng: sql<number>`ST_X(${pets.location}::geometry)`.as('lng'),
        locationPrecision: pets.locationPrecision,
        photoUrl: petPhotos.url,
        lastSeenAt: pets.lastSeenAt
      })
      .from(pets)
      .leftJoin(petPhotos, and(eq(petPhotos.petId, pets.id), eq(petPhotos.isPrimary, true)))
      .where(and(...conditions))
      .orderBy(desc(pets.lastSeenAt))
      .limit(limit);
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
  },

  async markReunited(petId: string, ctx: ActorCtx) {
    await assertCanEdit(petId, ctx);
    await db
      .update(pets)
      .set({ status: 'reunited', reunitedAt: new Date(), updatedAt: new Date() })
      .where(eq(pets.id, petId));
  },

  async markArchived(petId: string, ctx: ActorCtx) {
    await assertCanEdit(petId, ctx);
    await db
      .update(pets)
      .set({ status: 'archived', updatedAt: new Date() })
      .where(eq(pets.id, petId));
  },

  async markActive(petId: string, ctx: ActorCtx) {
    await assertCanEdit(petId, ctx);
    await db
      .update(pets)
      .set({ status: 'missing', updatedAt: new Date() })
      .where(eq(pets.id, petId));
  },

  async update(petId: string, data: UpdatePet, ctx: ActorCtx) {
    await assertCanEdit(petId, ctx);
    const { editToken: _token, ...fields } = data;
    const mapped: Record<string, unknown> = { updatedAt: new Date() };
    if (fields.name !== undefined) mapped.name = fields.name;
    if (fields.description !== undefined) mapped.description = fields.description;
    if (fields.color !== undefined) mapped.color = fields.color;
    if (fields.sex !== undefined) mapped.sex = fields.sex;
    if (fields.size !== undefined) mapped.size = fields.size;
    if (fields.breed !== undefined) mapped.breed = fields.breed;
    if (fields.colonia_id !== undefined) mapped.coloniaId = fields.colonia_id;
    if (fields.last_seen_at !== undefined) mapped.lastSeenAt = fields.last_seen_at;
    if (fields.contact_whatsapp !== undefined) mapped.contactWhatsapp = fields.contact_whatsapp;
    if (fields.contact_name !== undefined) mapped.contactName = fields.contact_name;
    if (fields.location !== undefined) {
      mapped.location = fields.location;
      mapped.locationPrecision = fields.location ? 'precise' : 'unknown';
    }
    await db.update(pets).set(mapped).where(eq(pets.id, petId));
  }
};

async function assertCanEdit(petId: string, ctx: ActorCtx) {
  const [pet] = await db
    .select({ reporterUserId: pets.reporterUserId, editToken: pets.editToken })
    .from(pets)
    .where(eq(pets.id, petId))
    .limit(1);
  if (!pet) throw new Error('NOT_FOUND');
  const isOwner = ctx.actorUserId && pet.reporterUserId === ctx.actorUserId;
  const validToken = ctx.editToken && pet.editToken === ctx.editToken;
  if (!isOwner && !validToken) throw new Error('FORBIDDEN');
}
