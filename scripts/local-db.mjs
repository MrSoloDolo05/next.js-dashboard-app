// Local development database (real PostgreSQL via embedded-postgres).
import EmbeddedPostgres from 'embedded-postgres';
import os from 'node:os';
import path from 'node:path';
import fs from 'node:fs';

const port = Number(process.env.EMBEDDED_PG_PORT ?? 5432);
const localAppData =
  process.env.LOCALAPPDATA ?? path.join(os.homedir(), '.local', 'share');
const databaseDir = path.resolve(
  process.env.EMBEDDED_PG_DATA_DIR ??
    path.join(localAppData, 'acme-dashboard', 'embedded-pg-data'),
);
fs.mkdirSync(databaseDir, { recursive: true });

const pg = new EmbeddedPostgres({
  databaseDir,
  user: 'postgres',
  password: 'postgres',
  port,
  persistent: true,
});

if (fs.readdirSync(databaseDir).length === 0) {
  console.log('Initialising new Postgres cluster (first run only)...');
  await pg.initialise();
}

await pg.start();

console.log(`Postgres dev database listening on 127.0.0.1:${port}`);
console.log(`Data directory: ${databaseDir}`);
console.log(`Connection string: postgres://postgres:postgres@127.0.0.1:${port}/postgres`);
console.log('Seed it by opening http://localhost:3000/seed (or run `pnpm db:seed`)');
console.log('Press Ctrl+C to stop.');

async function shutdown() {
  console.log('\nStopping the dev database...');
  await pg.stop();
  process.exit(0);
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);
