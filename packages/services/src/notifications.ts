import {
	db,
	notifications,
	notificationPreferences,
	pets,
	petPhotos,
	spottedPets,
	colonias,
	user,
} from '@scmascotas/db';
import { eq, and, desc, isNull, ne, isNotNull, count, sql } from 'drizzle-orm';
import { randomBytes } from 'node:crypto';
import type { PetNotifyLevel } from '@scmascotas/schemas';
import { scoreMatch } from './matching/score.js';
import { decideNotification } from './notifications/decide.js';
import {
	EXTERNAL_CHANNELS,
	type NotificationPayload,
	type NotificationRecipient,
	type ChannelPrefs,
} from './notifications/channels.js';

export { decideNotification, NOTIFY_THRESHOLD } from './notifications/decide.js';

function typeLabel(type: 'dog' | 'cat' | 'other'): string {
	return type === 'dog' ? 'perro' : type === 'cat' ? 'gato' : 'mascota';
}

type ActorCtx = { actorUserId?: string };

export const NotificationsService = {
	/**
	 * Fired fire-and-forget from SpottedPetsService.create. Structured-scores the
	 * new sighting against every active missing pet whose owner is signed in and
	 * hasn't turned alerts off, then dispatches per the pet's notifyLevel:
	 *   score ≥ NOTIFY_THRESHOLD        → "posible avistamiento" (any level ≠ off)
	 *   level='colonia' & same colonia  → "nueva actividad en tu colonia"
	 * The embedding usually isn't ready at create() time, so this runs on the
	 * structured signals (type/colonia/color/size/recency) only — which can clear
	 * 60 on their own. Idempotent via the notifications dedup index.
	 */
	async notifyOwnersForSpottedPet(
		spottedPetId: string,
		opts: { excludeUserId?: string } = {},
	): Promise<void> {
		const [spotted] = await db
			.select({
				id: spottedPets.id,
				slug: spottedPets.slug,
				type: spottedPets.type,
				color: spottedPets.color,
				size: spottedPets.size,
				coloniaId: spottedPets.coloniaId,
				colonia: colonias.name,
				createdAt: spottedPets.createdAt,
				embedding: spottedPets.embedding,
				lat: sql<number | null>`ST_Y(${spottedPets.location}::geometry)`.as('lat'),
				lng: sql<number | null>`ST_X(${spottedPets.location}::geometry)`.as('lng'),
				locationPrecision: spottedPets.locationPrecision,
			})
			.from(spottedPets)
			.leftJoin(colonias, eq(spottedPets.coloniaId, colonias.id))
			.where(eq(spottedPets.id, spottedPetId))
			.limit(1);

		if (!spotted) return;

		// Candidate owned missing pets of the same species, alerts not disabled.
		const candidates = await db
			.select({
				id: pets.id,
				slug: pets.slug,
				name: pets.name,
				color: pets.color,
				size: pets.size,
				coloniaId: pets.coloniaId,
				lastSeenAt: pets.lastSeenAt,
				notifyLevel: pets.notifyLevel,
				reporterUserId: pets.reporterUserId,
				embedding: petPhotos.embedding,
				lat: sql<number | null>`ST_Y(${pets.location}::geometry)`.as('lat'),
				lng: sql<number | null>`ST_X(${pets.location}::geometry)`.as('lng'),
				locationPrecision: pets.locationPrecision,
			})
			.from(pets)
			.leftJoin(petPhotos, and(eq(petPhotos.petId, pets.id), eq(petPhotos.isPrimary, true)))
			.where(
				and(
					eq(pets.status, 'missing'),
					eq(pets.type, spotted.type),
					isNotNull(pets.reporterUserId),
					ne(pets.notifyLevel, 'off'),
				),
			);

		const tLabel = typeLabel(spotted.type);
		const where = spotted.colonia ?? 'tu zona';

		for (const pet of candidates) {
			const ownerId = pet.reporterUserId!;
			if (opts.excludeUserId && ownerId === opts.excludeUserId) continue; // no self-notify

			const breakdown = scoreMatch(
				{
					type: spotted.type,
					coloniaId: spotted.coloniaId,
					color: spotted.color,
					size: spotted.size,
					createdAt: spotted.createdAt,
					embedding: spotted.embedding,
					lat: spotted.lat,
					lng: spotted.lng,
					locationPrecision: spotted.locationPrecision,
				},
				{
					type: spotted.type,
					coloniaId: pet.coloniaId,
					color: pet.color,
					size: pet.size,
					lastSeenAt: pet.lastSeenAt,
					embedding: pet.embedding,
					lat: pet.lat,
					lng: pet.lng,
					locationPrecision: pet.locationPrecision,
				},
			);

			const sameColonia = !!pet.coloniaId && pet.coloniaId === spotted.coloniaId;
			const decision = decideNotification({
				score: breakdown.total,
				notifyLevel: pet.notifyLevel,
				sameColonia,
			});
			if (!decision) continue;

			const payload: NotificationPayload =
				decision === 'match'
					? {
							type: 'match',
							title: `Posible avistamiento de ${pet.name ?? 'tu mascota'}`,
							body: `Alguien reportó un ${tLabel} en ${where} que podría ser tu mascota. Revisa la coincidencia.`,
							url: `/avistamientos/${spotted.slug}`,
							petId: pet.id,
							spottedPetId: spotted.id,
						}
					: {
							type: 'colonia_activity',
							title: 'Nueva actividad en tu colonia',
							body: `Se reportó un ${tLabel} en ${where}. Puede no ser tu mascota, pero quisimos avisarte.`,
							url: `/avistamientos/${spotted.slug}`,
							petId: pet.id,
							spottedPetId: spotted.id,
						};

			await this.dispatch(ownerId, payload);
		}
	},

	/**
	 * Write the in-app ledger row (also the dedup gate via the unique index),
	 * then fan out to any enabled external channels. If the ledger row already
	 * exists, we've notified before → skip everything (no duplicate emails).
	 */
	async dispatch(userId: string, payload: NotificationPayload): Promise<void> {
		const [row] = await db
			.insert(notifications)
			.values({
				userId,
				type: payload.type,
				title: payload.title,
				body: payload.body,
				url: payload.url ?? null,
				petId: payload.petId ?? null,
				spottedPetId: payload.spottedPetId ?? null,
			})
			.onConflictDoNothing()
			.returning({ id: notifications.id });

		if (!row) return; // dedup: already notified

		const prefs = await this.getPreferences(userId);
		const [u] = await db
			.select({ email: user.email, emailVerified: user.emailVerified, name: user.name })
			.from(user)
			.where(eq(user.id, userId))
			.limit(1);
		if (!u) return;

		const recipient: NotificationRecipient = {
			userId,
			email: u.email,
			emailVerified: u.emailVerified,
			name: u.name,
		};
		const channelPrefs: ChannelPrefs = {
			channelEmail: prefs.channelEmail,
			channelWhatsapp: prefs.channelWhatsapp,
			unsubscribeToken: prefs.unsubscribeToken,
		};

		for (const channel of EXTERNAL_CHANNELS) {
			if (!channel.isEnabled(channelPrefs, recipient)) continue;
			try {
				await channel.send(recipient, channelPrefs, payload);
			} catch (err) {
				console.error(`[notify] channel ${channel.key} failed for`, userId, err);
			}
		}
	},

	/** Get a user's prefs, lazily creating defaults (with an unsubscribe token). */
	async getPreferences(userId: string) {
		const [existing] = await db
			.select()
			.from(notificationPreferences)
			.where(eq(notificationPreferences.userId, userId))
			.limit(1);
		if (existing) return existing;

		await db
			.insert(notificationPreferences)
			.values({ userId, unsubscribeToken: randomBytes(16).toString('hex') })
			.onConflictDoNothing();

		const [created] = await db
			.select()
			.from(notificationPreferences)
			.where(eq(notificationPreferences.userId, userId))
			.limit(1);
		return created;
	},

	async updatePreferences(userId: string, patch: { channelEmail?: boolean }) {
		await this.getPreferences(userId); // ensure row exists
		const [updated] = await db
			.update(notificationPreferences)
			.set({ ...patch, updatedAt: new Date() })
			.where(eq(notificationPreferences.userId, userId))
			.returning();
		return updated;
	},

	/** Set a pet's notification aggressiveness. Owner-only. */
	async setPetNotifyLevel(petId: string, level: PetNotifyLevel, ctx: ActorCtx) {
		const [pet] = await db
			.select({ reporterUserId: pets.reporterUserId })
			.from(pets)
			.where(eq(pets.id, petId))
			.limit(1);
		if (!pet) throw new Error('NOT_FOUND');
		if (!ctx.actorUserId || pet.reporterUserId !== ctx.actorUserId) throw new Error('FORBIDDEN');
		await db
			.update(pets)
			.set({ notifyLevel: level, updatedAt: new Date() })
			.where(eq(pets.id, petId));
	},

	async list(userId: string, opts: { limit?: number } = {}) {
		const { limit = 30 } = opts;
		return db
			.select()
			.from(notifications)
			.where(eq(notifications.userId, userId))
			.orderBy(desc(notifications.createdAt))
			.limit(limit);
	},

	async unreadCount(userId: string): Promise<number> {
		const [row] = await db
			.select({ value: count() })
			.from(notifications)
			.where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
		return row?.value ?? 0;
	},

	async markRead(id: string, userId: string) {
		await db
			.update(notifications)
			.set({ readAt: new Date() })
			.where(
				and(
					eq(notifications.id, id),
					eq(notifications.userId, userId),
					isNull(notifications.readAt),
				),
			);
	},

	async markAllRead(userId: string) {
		await db
			.update(notifications)
			.set({ readAt: new Date() })
			.where(and(eq(notifications.userId, userId), isNull(notifications.readAt)));
	},

	/** Backs the one-click email unsubscribe link. Turns email off. */
	async unsubscribeByToken(token: string): Promise<boolean> {
		const [row] = await db
			.update(notificationPreferences)
			.set({ channelEmail: false, updatedAt: new Date() })
			.where(eq(notificationPreferences.unsubscribeToken, token))
			.returning({ userId: notificationPreferences.userId });
		return !!row;
	},
};
