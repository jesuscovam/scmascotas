import { config } from 'dotenv';
import { defineConfig } from 'drizzle-kit';
import { neonConfig } from '@neondatabase/serverless';
import ws from 'ws';

// In Node.js environments (local dev, CI) the native WebSocket doesn't support
// Neon's connection parameters. Configure the ws package so drizzle-kit can
// open the WebSocket connection it needs for migrations.
neonConfig.webSocketConstructor = ws;

config({ path: '.env.local' });

export default defineConfig({
  schema: './src/schema/index.ts',
  out: './migrations',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!
  }
});
