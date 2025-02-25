import { MiddlewareConsumer, Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import { SECOND } from 'libs/basic-utils/const/time-const';
import { ENV } from './global/constant';

import { RequestLoggerMiddleware } from 'src/global/middlewares/request-logger.middleware';
import { DrizzleModule } from './drizzle/drizzle.module';
import { CacheModule } from './cache/cache.module';
import { QueueModule } from './queue/queue.module';
import { ProductModule } from './product/product.module';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        skipIf: () => !ENV.THROTTLER_ENABLED,
        ttl: ENV.THROTTLER_TTL_SEC * SECOND,
        limit: ENV.THROTTLER_LIMIT,
        blockDuration: ENV.THROTTLER_BLOCK_DURATION_SEC * SECOND,
      },
    ]),
    DrizzleModule,
    CacheModule,
    QueueModule,
    ProductModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // 用於紀錄所有 4xx 以上的請求
    consumer.apply(RequestLoggerMiddleware).forRoutes('*');
  }
}
