import { Global, Module } from '@nestjs/common';
import { DrizzleService } from './drizzle.service';
// import { drizzle } from 'drizzle-orm/node-postgres';
// import { Pool } from 'pg';
// import * as schema from './schema';
// import { NodePgDatabase } from 'drizzle-orm/node-postgres';
// import { ENV } from 'src/global/constant';
// export const DrizzleAsyncProvider = 'DrizzleAsyncProvider';
@Global()
@Module({
  providers: [
    DrizzleService,
    // {
    //   provide: DrizzleAsyncProvider,
    //   useFactory: () => {
    //     const pool = new Pool({
    //       connectionString: ENV.DATABASE_URL,
    //     });
    //     return drizzle(pool, { schema }) as NodePgDatabase<typeof schema>;
    //   },
    // },
  ],
  exports: [DrizzleService],
})
export class DrizzleModule {}
