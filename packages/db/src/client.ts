import { neon } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';
import * as schema from './schema/index.js';

type Db = NeonHttpDatabase<typeof schema>;

let _db: Db | null = null;

export function initDb(url: string) {
  const sql = neon(url);
  _db = drizzle(sql, { schema });
}

export const db: Db = new Proxy({} as Db, {
  get(_, prop) {
    if (!_db) throw new Error('DB not initialized — call initDb(DATABASE_URL) in hooks.server.ts');
    return _db[prop as keyof Db];
  }
});
