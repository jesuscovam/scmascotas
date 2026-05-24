import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { colonias } from './colonias.js';
import { pets, petTypeEnum, petSizeEnum } from './pets.js';

export const spottedPetStatusEnum = pgEnum('spotted_pet_status', ['open', 'resolved']);

export const spottedPets = pgTable('spotted_pets', {
	id:              uuid('id').primaryKey().defaultRandom(),
	slug:            text('slug').unique().notNull(),
	type:            petTypeEnum('type').notNull(),
	description:     text('description'),
	coloniaId:       uuid('colonia_id').references(() => colonias.id),
	color:           text('color'),
	size:            petSizeEnum('size'),
	photoUrl:        text('photo_url'),
	contactWhatsapp: text('contact_whatsapp'),
	editToken:       text('edit_token').notNull(),
	reporterUserId:  text('reporter_user_id'),
	reporterIpHash:  text('reporter_ip_hash'),
	matchedPetId:    uuid('matched_pet_id').references(() => pets.id),
	status:          spottedPetStatusEnum('status').notNull().default('open'),
	createdAt:       timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
	updatedAt:       timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
