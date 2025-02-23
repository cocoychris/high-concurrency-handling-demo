import { defineConfig } from 'drizzle-kit';
import dotenv from 'dotenv';

const { parsed: ENV } = dotenv.config();
if (!ENV) {
  throw new Error('Failed to load .env file');
}
export default defineConfig({
  out: './src/drizzle/migrations',
  dialect: 'postgresql',
  schema: './src/drizzle/schema.ts',
  // driver: 'pglite',
  dbCredentials: {
    url: `postgresql://${ENV.POSTGRES_USER}:${ENV.POSTGRES_PASSWORD}@${ENV.POSTGRES_HOST}:${ENV.POSTGRES_PORT}/${ENV.POSTGRES_DB}?schema=public`,
  },
  //   extensionsFilters: ['postgis'],
  //   schemaFilter: 'public',
  //   tablesFilter: '*',
  //   introspect: {
  //     casing: 'camel',
  //   },
  //   migrations: {
  //     prefix: 'timestamp',
  //     table: '__drizzle_migrations__',
  //     schema: 'public',
  //   },
  //   entities: {
  //     roles: {
  //       provider: '',
  //       exclude: [],
  //       include: [],
  //     },
  //   },
  //   breakpoints: true,
  strict: true,
  verbose: true,
});
