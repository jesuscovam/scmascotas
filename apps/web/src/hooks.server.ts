import {sequence} from '@sveltejs/kit/hooks';
import * as Sentry from '@sentry/sveltekit';
import { env } from '$env/dynamic/private';
import { initDb } from '@scmascotas/db';

initDb(env.OVERRIDE_NIGHTLY_DATABASE_URL ?? env.DATABASE_URL!);
export const handleError = Sentry.handleErrorWithSentry();
export const handle = sequence(Sentry.sentryHandle());