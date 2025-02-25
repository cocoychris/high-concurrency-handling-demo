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
class _CacheService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger('CacheService');

  constructor() {
    const obj = client as any;
    obj.onModuleInit = this.onModuleInit.bind(this);
    obj.onModuleDestroy = this.onModuleDestroy.bind(this);
    return obj;
  }

  async onModuleInit() {
    client.on('error', (error) => this.logger.error(`Redis error: ${error}`));
    client.on('connect', () => {
      this.logger.log('Connected to Redis');
    });
    await client.connect();
  }

  async onModuleDestroy() {
    this.logger.log('Closing Redis connection...');
    await client.quit();
  }
}

export const CacheService = _CacheService;
export type CacheService = typeof client;
