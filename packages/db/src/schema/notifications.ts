import { pgTable, uuid, text, timestamp, pgEnum, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { user } from './auth.js';
import { pets } from './pets.js';
import { spottedPets } from './spotted_pets.js';

export const notificationTypeEnum = pgEnum('notification_type', [
  'match',
  'colonia_activity',
  'system',
]);

export const notifications = pgTable(
  'notifications',
  {
    id:           uuid('id').primaryKey().defaultRandom(),
    userId:       text('user_id').notNull().references(() => user.id, { onDelete: 'cascade' }),
    type:         notificationTypeEnum('type').notNull(),
    title:        text('title').notNull(),
    body:         text('body').notNull(),
    url:          text('url'),
    petId:        uuid('pet_id').references(() => pets.id, { onDelete: 'cascade' }),
    spottedPetId: uuid('spotted_pet_id').references(() => spottedPets.id, { onDelete: 'cascade' }),
    readAt:       timestamp('read_at', { withTimezone: true }),
    createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    index('notifications_user_created_idx').on(table.userId, table.createdAt),
    // Dedup key — keeps NotificationsService.dispatch idempotent so a re-run of
    // the spotted-pet trigger never double-notifies the same owner about the
    // same (pet, sighting) pair.
    uniqueIndex('notifications_dedup_idx').on(
      table.userId,
      table.type,
      table.petId,
      table.spottedPetId,
    ),
  ]
);
