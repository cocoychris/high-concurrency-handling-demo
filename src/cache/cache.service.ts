import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as redis from 'redis';
import { ENV } from 'src/global/constant';

@Injectable()
export class CacheService implements OnModuleInit, OnModuleDestroy {
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

  hSet(key: string, field: string, value: string) {
    return this.client.hSet(key, field, value);
  }

  hGet(key: string, field: string) {
    return this.client.hGet(key, field);
  }

  hDel(key: string, field: string) {
    return this.client.hDel(key, field);
  }

  hIncrBy(key: string, field: string, value: number) {
    return this.client.hIncrBy(key, field, value);
  }

  hGetAll(key: string) {
    return this.client.hGetAll(key);
  }

  hExists(key: string, field: string) {
    return this.client.hExists(key, field);
  }

  multi() {
    return this.client.multi();
  }
}
