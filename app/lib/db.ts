import postgres from 'postgres';

// Single shared Postgres client (a module-level singleton so that hot reloads
// in development do not open a new connection pool on every request).
//
// Hosted providers (Vercel Postgres, Neon, Supabase...) require TLS, while a
// database running on localhost - e.g. the bundled development database that
// is started with `pnpm db:up` - does not. Set POSTGRES_SSL="false" in .env to
// turn TLS off for local development.
export const sql = postgres(process.env.POSTGRES_URL!, {
  ssl: process.env.POSTGRES_SSL === 'false' ? false : 'require',
});
