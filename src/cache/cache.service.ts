import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as redis from 'redis';
import { ENV } from 'src/global/constant';

const client = redis.createClient({
  url: ENV.REDIS_URL,
});

@Injectable()
class CacheServiceBase {
  constructor() {
    return client;
  }
}

class _CacheService
  extends CacheServiceBase
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger: Logger = new Logger(this.constructor.name);
  private readonly client = redis.createClient({
    url: ENV.REDIS_URL,
  });
  async onModuleInit() {
    this.client.on('error', (error) =>
      this.logger.error(`Redis error: ${error}`),
    );
    this.client.on('connect', () => {
      this.logger.log('Connected to Redis');
    });
    await this.client.connect();
  }

  async onModuleDestroy() {
    this.logger.log('Closing Redis connection...');
    await this.client.quit();
  }
}

export const CacheService = _CacheService;
export type CacheService = typeof client;
