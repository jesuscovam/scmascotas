import { pgTable, uuid, text } from 'drizzle-orm/pg-core';
import { geographyPointColumn } from './geography-type.js';

export const colonias = pgTable('colonias', {
  id: uuid('id').primaryKey().defaultRandom(),
  name: text('name').notNull().unique(),
  slug: text('slug').notNull().unique(),
  centroid: geographyPointColumn('centroid')
});
