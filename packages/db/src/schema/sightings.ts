import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';
import { pets } from './pets.js';

export const sightings = pgTable('sightings', {
  id: uuid('id').primaryKey().defaultRandom(),
  petId: uuid('pet_id').notNull().references(() => pets.id, { onDelete: 'cascade' }),
  description: text('description'),
  colonia: text('colonia'),
  reporterIpHash: text('reporter_ip_hash'),
  reporterUserId: text('reporter_user_id'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow()
});
