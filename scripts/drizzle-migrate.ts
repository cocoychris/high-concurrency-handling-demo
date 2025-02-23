import { eq } from 'drizzle-orm';
import { type NodePgDatabase, drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import path from 'path';
import pg from 'pg';
import { exit } from 'process';
import * as allSchema from '../src/drizzle/schema';
import { ENV } from '../src/global/constant';

main().catch((e) => {
  console.error(e);
  exit(1);
});

async function main() {
  console.log('Starting migration...');
  await createDatabase();

  const pool = new pg.Pool({
    connectionString: ENV.DATABASE_URL,
  });

  let db: NodePgDatabase<typeof allSchema> = drizzle(pool, {
    schema: {
      ...allSchema,
    },
  });

  // Look for migrations in the src/drizzle/migrations folder
  const migrationPath = path.join(process.cwd(), 'src/drizzle/migrations');

  // Run the migrations
  await migrate(db, { migrationsFolder: migrationPath });

  // Insert default roles
  for (const role of ['Super Admin', 'Admin', 'User', 'Guest']) {
    const existingUserRole = await db
      ?.select({
        name: allSchema.user_role.name,
      })
      .from(allSchema.user_role)
      .where(eq(allSchema.user_role.name, role));
    if (!existingUserRole[0]) {
      await db?.insert(allSchema.user_role).values({ name: role });
    }
  }
  console.log('Migration complete');
  exit(0);
}

async function createDatabase() {
  const client = new pg.Client({
    user: ENV.POSTGRES_USER,
    host: ENV.POSTGRES_HOST,
    password: ENV.POSTGRES_PASSWORD,
    port: ENV.POSTGRES_PORT,
    database: 'postgres', // Connect to the default database to create the new one
  });
  try {
    await client.connect();
    const res = await client.query(
      `SELECT 1 FROM pg_database WHERE datname='${ENV.POSTGRES_DB}'`,
    );
    if (res.rowCount === 0) {
      await client.query(`CREATE DATABASE "${ENV.POSTGRES_DB}"`);
      console.log(`Database "${ENV.POSTGRES_DB}" created successfully.`);
    }
  } catch (err) {
    console.error('Error creating database:', err);
    await client.end();
    exit(1);
  }
  await client.end();
}
