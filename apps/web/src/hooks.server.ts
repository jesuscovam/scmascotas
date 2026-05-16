import { env } from '$env/dynamic/private';
import { initDb } from '@scmascotas/db';

initDb(env.DATABASE_URL!);
