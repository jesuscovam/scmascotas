import { DATABASE_URL } from '$env/static/private';
import { initDb } from '@scpets/db';

initDb(DATABASE_URL);
