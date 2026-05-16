import { env } from '$env/dynamic/private';
import { initDb } from '@scmascotas/db';

initDb(env.OVERRIDE_NIGHTLY_DATABASE_URL ?? env.DATABASE_URL!);
