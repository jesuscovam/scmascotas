import { DATABASE_URL } from '$env/static/private';
import { initDb } from '@scmascotas/db';

initDb(DATABASE_URL);
