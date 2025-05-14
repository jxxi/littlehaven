/* eslint-disable import/no-extraneous-dependencies */
import * as dotenv from 'dotenv';
import type { Config } from 'drizzle-kit';

// Load environment variables based on NODE_ENV
const env = process.env.NODE_ENV || 'development';
dotenv.config({
  path: env === 'production' ? '.env.production' : '.env.local',
});

export default {
  schema: './src/models/Schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: process.env.DATABASE_URL!,
  },
} satisfies Config;
