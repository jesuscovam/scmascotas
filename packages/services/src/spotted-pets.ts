import { db, spottedPets, colonias, pets } from '@scmascotas/db';
import { eq, desc, and, isNull, sql } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { put } from '@vercel/blob';
import type { CreateSpottedPet } from '@scmascotas/schemas';
import { EmbeddingsService } from './embeddings.js';

function generateSlug(): string {
	return `avistamiento-${randomBytes(4).toString('hex')}`;
}

export const SpottedPetsService = {
	async create(
		data: CreateSpottedPet,
		ctx: { ipHash?: string; userId?: string } = {}
	) {
		const slug = generateSlug();
		const editToken = randomBytes(16).toString('hex');

		const [record] = await db
			.insert(spottedPets)
			.values({
				slug,
				editToken,
				type: data.type,
				coloniaId: data.coloniaId,
				description: data.description,
				color: data.color,
				size: data.size,
				contactWhatsapp: data.contactWhatsapp,
				matchedPetId: data.matchedPetId,
				reporterUserId: ctx.userId,
				reporterIpHash: ctx.ipHash,
				location: data.location,
				locationPrecision: data.location ? 'precise' : 'unknown',
			})
			.returning();

		// Bump the linked pet's lastSeenAt so it rises in the listing.
		if (data.matchedPetId) {
			await db
				.update(pets)
				.set({ lastSeenAt: new Date(), updatedAt: new Date() })
				.where(eq(pets.id, data.matchedPetId));
		}

		return { ...record, editToken };
	},

	async getBySlug(slug: string) {
		const [row] = await db
			.select({
				id: spottedPets.id,
				slug: spottedPets.slug,
				type: spottedPets.type,
				description: spottedPets.description,
				coloniaId: spottedPets.coloniaId,
				color: spottedPets.color,
				size: spottedPets.size,
				photoUrl: spottedPets.photoUrl,
				contactWhatsapp: spottedPets.contactWhatsapp,
				matchedPetId: spottedPets.matchedPetId,
				status: spottedPets.status,
				createdAt: spottedPets.createdAt,
				colonia: colonias.name,
				matchedPetSlug: pets.slug,
				matchedPetName: pets.name,
				matchedPetType: pets.type,
			})
			.from(spottedPets)
			.leftJoin(colonias, eq(spottedPets.coloniaId, colonias.id))
			.leftJoin(pets, eq(spottedPets.matchedPetId, pets.id))
			.where(eq(spottedPets.slug, slug))
			.limit(1);
		return row ?? null;
	},

	async listForPet(petId: string) {
		return db
			.select({
				id: spottedPets.id,
				description: spottedPets.description,
				colonia: colonias.name,
				createdAt: spottedPets.createdAt,
			})
			.from(spottedPets)
			.leftJoin(colonias, eq(spottedPets.coloniaId, colonias.id))
			.where(eq(spottedPets.matchedPetId, petId))
			.orderBy(desc(spottedPets.createdAt))
			.limit(20);
	},

	async listByColonia(coloniaId: string) {
		return db
			.select({
				id: spottedPets.id,
				slug: spottedPets.slug,
				type: spottedPets.type,
				description: spottedPets.description,
				color: spottedPets.color,
				size: spottedPets.size,
				photoUrl: spottedPets.photoUrl,
				colonia: colonias.name,
				coloniaId: spottedPets.coloniaId,
				status: spottedPets.status,
				createdAt: spottedPets.createdAt,
			})
			.from(spottedPets)
			.leftJoin(colonias, eq(spottedPets.coloniaId, colonias.id))
			.where(eq(spottedPets.coloniaId, coloniaId))
			.orderBy(desc(spottedPets.createdAt));
	},

	async listAll(opts: { type?: 'dog' | 'cat' | 'other'; coloniaId?: string } = {}) {
		const conditions: ReturnType<typeof eq>[] = [eq(spottedPets.status, 'open')];
		if (opts.type) conditions.push(eq(spottedPets.type, opts.type));
		if (opts.coloniaId) conditions.push(eq(spottedPets.coloniaId, opts.coloniaId));
		return db
			.select({
				id: spottedPets.id,
				slug: spottedPets.slug,
				type: spottedPets.type,
				description: spottedPets.description,
				color: spottedPets.color,
				size: spottedPets.size,
				photoUrl: spottedPets.photoUrl,
				colonia: colonias.name,
				coloniaId: spottedPets.coloniaId,
				status: spottedPets.status,
				createdAt: spottedPets.createdAt,
			})
			.from(spottedPets)
			.leftJoin(colonias, eq(spottedPets.coloniaId, colonias.id))
			.where(and(...conditions))
			.orderBy(desc(spottedPets.createdAt));
	},

	async listByUser(userId: string) {
		return db
			.select({
				id: spottedPets.id,
				slug: spottedPets.slug,
				type: spottedPets.type,
				description: spottedPets.description,
				color: spottedPets.color,
				size: spottedPets.size,
				photoUrl: spottedPets.photoUrl,
				status: spottedPets.status,
				createdAt: spottedPets.createdAt,
				colonia: colonias.name,
				matchedPetSlug: pets.slug,
				matchedPetName: pets.name,
			})
			.from(spottedPets)
			.leftJoin(colonias, eq(spottedPets.coloniaId, colonias.id))
			.leftJoin(pets, eq(spottedPets.matchedPetId, pets.id))
			.where(eq(spottedPets.reporterUserId, userId))
			.orderBy(desc(spottedPets.createdAt));
	},

	async claim(editToken: string, userId: string) {
		const [row] = await db
			.update(spottedPets)
			.set({ reporterUserId: userId, updatedAt: new Date() })
			.where(and(eq(spottedPets.editToken, editToken), isNull(spottedPets.reporterUserId)))
			.returning({ id: spottedPets.id });
		return row ?? null;
	},

	async archive(id: string, userId: string) {
		const [row] = await db
			.select({ reporterUserId: spottedPets.reporterUserId })
			.from(spottedPets)
			.where(eq(spottedPets.id, id))
			.limit(1);
		if (!row) throw new Error('NOT_FOUND');
		if (row.reporterUserId !== userId) throw new Error('FORBIDDEN');
		await db
			.update(spottedPets)
			.set({ status: 'archived', updatedAt: new Date() })
			.where(eq(spottedPets.id, id));
	},

	async unarchive(id: string, userId: string) {
		const [row] = await db
			.select({ reporterUserId: spottedPets.reporterUserId })
			.from(spottedPets)
			.where(eq(spottedPets.id, id))
			.limit(1);
		if (!row) throw new Error('NOT_FOUND');
		if (row.reporterUserId !== userId) throw new Error('FORBIDDEN');
		await db
			.update(spottedPets)
			.set({ status: 'open', updatedAt: new Date() })
			.where(eq(spottedPets.id, id));
	},

	async uploadPhoto(id: string, file: File, blobToken?: string, replicateToken?: string) {
		const blob = await put(`spotted/${id}/${file.name}`, file, { access: 'public', ...(blobToken ? { token: blobToken } : {}) });
		await db
			.update(spottedPets)
			.set({ photoUrl: blob.url, updatedAt: new Date() })
			.where(eq(spottedPets.id, id));

		// Fire-and-forget: embed after URL is saved; don't block the response
		EmbeddingsService.generate(blob.url, replicateToken)
			.then((embedding) => {
				if (!embedding) return;
				return db
					.update(spottedPets)
					.set({ embedding })
					.where(eq(spottedPets.id, id));
			})
			.catch((err) => console.error('[embeddings] spotted pet failed, id=', id, err));

		return blob.url;
	},

	/**
	 * Spotted-pet reports inside a map viewport. Returns precise coordinates
	 * from the DB — callers are responsible for fuzzing before exposing them
	 * publicly. See `LocationService.fuzz` and the `/api/spotted-pets/map`
	 * route for the public-facing path.
	 */
	async listInBounds(opts: {
		north: number;
		south: number;
		east: number;
		west: number;
		status?: 'open' | 'resolved' | 'archived';
		type?: 'dog' | 'cat' | 'other';
		limit?: number;
	}) {
		const { north, south, east, west, status = 'open', type, limit = 500 } = opts;
		const conditions = [
			eq(spottedPets.status, status),
			sql`${spottedPets.location} IS NOT NULL`,
			sql`${spottedPets.location} && ST_MakeEnvelope(${west}, ${south}, ${east}, ${north}, 4326)::geography`,
		];
		if (type) conditions.push(eq(spottedPets.type, type));

		return db
			.select({
				id: spottedPets.id,
				slug: spottedPets.slug,
				type: spottedPets.type,
				lat: sql<number>`ST_Y(${spottedPets.location}::geometry)`.as('lat'),
				lng: sql<number>`ST_X(${spottedPets.location}::geometry)`.as('lng'),
				locationPrecision: spottedPets.locationPrecision,
				photoUrl: spottedPets.photoUrl,
				createdAt: spottedPets.createdAt,
			})
			.from(spottedPets)
			.where(and(...conditions))
			.orderBy(desc(spottedPets.createdAt))
			.limit(limit);
	},
};
