import { Injectable, Logger } from '@nestjs/common';
import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { ENV } from 'src/global/constant';
import * as schema from './schema';

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
@Injectable()
class _DrizzleService {
  public logger: Logger = new Logger('DrizzleService');

  constructor() {
    const obj = drizzle(pool, { schema }) as any;
    obj.onModuleInit = this.onModuleInit.bind(this);
    obj.onModuleDestroy = this.onModuleDestroy.bind(this);
    return obj;
  }

  async onModuleInit() {
    this.logger.log(`Connecting to PostgreSQL: ${ENV.DATABASE_URL}`);
    try {
      await pool.connect();
      this.logger.log('Connected to PostgreSQL');
    } catch (error) {
      this.logger.error(`Failed to connect to PostgreSQL: ${error}`);
    }
  }

  async onModuleDestroy() {
    await pool.end();
  }
}

export const DrizzleService = _DrizzleService;
export type DrizzleService = NodePgDatabase<typeof schema>;
