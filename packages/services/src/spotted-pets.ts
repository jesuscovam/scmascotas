import { db, spottedPets, colonias } from '@scmascotas/db';
import { eq, desc } from 'drizzle-orm';
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

	async uploadPhoto(id: string, file: File) {
		const blob = await put(`spotted/${id}/${file.name}`, file, { access: 'public' });
		await db
			.update(spottedPets)
			.set({ photoUrl: blob.url, updatedAt: new Date() })
			.where(eq(spottedPets.id, id));
		return blob.url;
	},
};
