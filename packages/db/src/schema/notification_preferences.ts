import { pgTable, text, boolean, timestamp } from 'drizzle-orm/pg-core';
import { user } from './auth.js';

export const notificationPreferences = pgTable('notification_preferences', {
  userId:           text('user_id').primaryKey().references(() => user.id, { onDelete: 'cascade' }),
  channelEmail:     boolean('channel_email').notNull().default(true),
  channelInApp:     boolean('channel_in_app').notNull().default(true),
  channelWhatsapp:  boolean('channel_whatsapp').notNull().default(false), // seam — off until Business API lands
  unsubscribeToken: text('unsubscribe_token').notNull().unique(),
  createdAt:        timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt:        timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});
