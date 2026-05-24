import { pgTable, uuid, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { pets } from './pets.js';
import { vectorColumn } from './vector-type.js';

export const petPhotos = pgTable('pet_photos', {
  id:        uuid('id').primaryKey().defaultRandom(),
  petId:     uuid('pet_id').notNull().references(() => pets.id, { onDelete: 'cascade' }),
  url:       text('url').notNull(),
  isPrimary: boolean('is_primary').notNull().default(false),
  embedding: vectorColumn('embedding', 768),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
