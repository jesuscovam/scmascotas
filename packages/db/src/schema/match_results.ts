import { pgTable, uuid, text, integer, timestamp, uniqueIndex, index } from 'drizzle-orm/pg-core';
import { pets } from './pets.js';
import { spottedPets } from './spotted_pets.js';

export const matchResults = pgTable(
  'match_results',
  {
    id:           uuid('id').primaryKey().defaultRandom(),
    spottedPetId: uuid('spotted_pet_id').notNull().references(() => spottedPets.id, { onDelete: 'cascade' }),
    petId:        uuid('pet_id').notNull().references(() => pets.id, { onDelete: 'cascade' }),
    score:        integer('score').notNull(),
    visualScore:  integer('visual_score'),   // 0 | 5 | 10 | 15 | 20 — null on older rows
    humanVerdict: text('human_verdict'),     // 'match' | 'no_match' | null
    createdAt:    timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt:    timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [
    uniqueIndex('match_results_spotted_pet_unique').on(table.spottedPetId, table.petId),
    index('match_results_spotted_pet_idx').on(table.spottedPetId),
  ]
);
