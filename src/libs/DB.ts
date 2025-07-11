/* eslint-disable no-console */
import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import path from 'path';
import { Client } from 'pg';

import * as schema from '@/models/Schema';
import { logError } from '@/utils/Logger';

import { Env } from './Env';

let client;
let drizzle;

// Always use Postgres if DATABASE_URL is set, regardless of NODE_ENV
if (Env.DATABASE_URL) {
  try {
    client = new Client({
      connectionString: Env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
    });
    await client.connect();

    drizzle = drizzlePg(client, { schema });
    await migratePg(drizzle, {
      migrationsFolder: path.join(process.cwd(), 'migrations'),
    });
  } catch (error) {
    logError('Failed to connect to Postgres', error);
  }
} else {
  const global = globalThis as unknown as { client: PGlite };

  if (!global.client) {
    global.client = new PGlite();
    await global.client.waitReady;
  }

  drizzle = drizzlePglite(global.client, { schema });
  await migratePglite(drizzle, {
    migrationsFolder: path.join(process.cwd(), 'migrations'),
  });
}

export const db = drizzle;
