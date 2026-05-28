import { pgTable, uuid, text, timestamp, pgEnum } from 'drizzle-orm/pg-core';
import { colonias } from './colonias.js';
import { geographyPointColumn } from './geography-type.js';

export const petTypeEnum = pgEnum('pet_type', ['dog', 'cat', 'other']);
export const petStatusEnum = pgEnum('pet_status', ['missing', 'reunited', 'archived']);
export const petSexEnum = pgEnum('pet_sex', ['male', 'female', 'unknown']);
export const petSizeEnum = pgEnum('pet_size', ['small', 'medium', 'large']);
export const locationPrecisionEnum = pgEnum('location_precision', ['precise', 'colonia', 'unknown']);

export const pets = pgTable('pets', {
  id: uuid('id').primaryKey().defaultRandom(),
  slug: text('slug').unique().notNull(),
  type: petTypeEnum('type').notNull(),
  name: text('name'),
  description: text('description'),
  coloniaId: uuid('colonia_id').references(() => colonias.id),
  lastSeenAt: timestamp('last_seen_at', { withTimezone: true }).notNull(),
  status: petStatusEnum('status').notNull().default('missing'),
  color: text('color'),
  sex: petSexEnum('sex').notNull().default('unknown'),
  size: petSizeEnum('size'),
  breed: text('breed'),
  contactWhatsapp: text('contact_whatsapp'),
  contactName: text('contact_name'),
  anonymous: text('anonymous').notNull().default('false'),
  editToken: text('edit_token').notNull(),
  reporterUserId: text('reporter_user_id'),
  reporterIpHash: text('reporter_ip_hash'),
  reunitedAt: timestamp('reunited_at', { withTimezone: true }),
  location: geographyPointColumn('location'),
  locationPrecision: locationPrecisionEnum('location_precision').notNull().default('unknown'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow()
});
