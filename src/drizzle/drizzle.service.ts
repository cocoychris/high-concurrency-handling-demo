import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ENV } from 'src/global/constant';
import * as schema from './schema';
import { OnModuleDestroy } from '@nestjs/common';

export const pool = new Pool({
  connectionString: ENV.DATABASE_URL,
});
/**
 * 使用特殊的方式建立 DrizzleService 以便讓 TS 開心
 *
 * 好處：
 * 可以直接將 drizzle 實例當作 `DrizzleService` 使用，
 * 不用多一層 `drizzleService.drizzle`
 */
class _DrizzleServiceBase {
  constructor() {
    return drizzle(pool, { schema });
  }
}
class _DrizzleService extends _DrizzleServiceBase implements OnModuleDestroy {
  async onModuleDestroy() {
    await pool.end();
  }
}
export const DrizzleService = _DrizzleService;
export type DrizzleService = NodePgDatabase<typeof schema>;
