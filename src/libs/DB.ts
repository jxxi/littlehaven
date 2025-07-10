/* eslint-disable no-console */
import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { migrate as migratePg } from 'drizzle-orm/node-postgres/migrator';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';
import { migrate as migratePglite } from 'drizzle-orm/pglite/migrator';
import path from 'path';
import { Client } from 'pg';

import * as schema from '@/models/Schema';

import { Env } from './Env';

let client;
let drizzle;

// Use real PostgreSQL in production, PGlite in development
if (process.env.NODE_ENV === 'production' && Env.DATABASE_URL) {
  try {
    console.log('Connecting to production database...');
    client = new Client({
      connectionString: Env.DATABASE_URL,
      ssl:
        process.env.NODE_ENV === 'production'
          ? { rejectUnauthorized: false }
          : false,
    });
    await client.connect();
    console.log('Successfully connected to production database');

    drizzle = drizzlePg(client, { schema });
    await migratePg(drizzle, {
      migrationsFolder: path.join(process.cwd(), 'migrations'),
    });
    console.log('Database migrations completed');
  } catch (error) {
    // eslint-disable-next-line no-console
    console.error('Failed to connect to production database:', error);
    console.log('Falling back to PGlite...');
    // Fallback to PGlite if production database fails
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
} else {
  console.log('Using PGlite for development');
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
