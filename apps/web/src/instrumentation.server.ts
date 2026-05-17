import * as Sentry from '@sentry/sveltekit';

Sentry.init({
  dsn: 'https://7b7715c7ef73263f1c137edbd28d69de@o460553.ingest.us.sentry.io/4511402966843392',

  tracesSampleRate: 1.0,

  // Enable logs to be sent to Sentry
  enableLogs: true,

  // uncomment the line below to enable Spotlight (https://spotlightjs.com)
  // spotlight: import.meta.env.DEV,
});