// Browser-safe entry point. Re-exports the pure helpers that don't touch
// node:crypto / @scmascotas/db / @vercel/blob — so the client bundle stays
// free of server-only deps. Server-side code should keep importing from
// `@scmascotas/services` (the full barrel).
export * from './location.js';
export * from './utils/whatsapp.js';
