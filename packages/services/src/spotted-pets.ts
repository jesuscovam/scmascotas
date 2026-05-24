import { db, spottedPets, colonias, pets } from '@scmascotas/db';
import { eq, desc, and } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import { put } from '@vercel/blob';
import type { CreateSpottedPet } from '@scmascotas/schemas';

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
			})
			.returning();

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

	async uploadPhoto(id: string, file: File) {
		const blob = await put(`spotted/${id}/${file.name}`, file, { access: 'public' });
		await db
			.update(spottedPets)
			.set({ photoUrl: blob.url, updatedAt: new Date() })
			.where(eq(spottedPets.id, id));
		return blob.url;
	},
};
