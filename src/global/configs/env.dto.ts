import { Expose, Transform } from 'class-transformer';
import { EnvBaseDto } from './env-base.dto';
import { IsInt, IsOptional, IsString } from 'class-validator';
import {
  emptyStringToUndefined,
  stringToInteger,
} from 'libs/basic-utils/data/type-transform';

export class EnvDto extends EnvBaseDto {
  /**
   * Redis 連線 URL (選填)
   *
   * 格式：
   * redis[s]://[[username][:password]@][host][:port][/db-number]
   */
  @Expose()
  @Transform(emptyStringToUndefined)
  @IsString()
  @IsOptional()
  REDIS_URL?: string;

  /**
   * RabbitMQ 連線 URL (選填)
   *
   * 格式：
   * amqp[s]://[username[:password]@]hostname[:port][/vhost]
   *
   * @see https://www.rabbitmq.com/docs/uri-spec#the-amqp-uri-scheme
   * @example 'amqp://guest:guest@localhost:5672'
   * @default 'amqp://localhost'
   */
  @Expose()
  @Transform(emptyStringToUndefined)
  @IsString()
  @IsOptional()
  RABBIT_MQ_URL: string = 'amqp://localhost';

  /**
   * RabbitMQ Pool 中的最小連線數
   */
  @Expose()
  @Transform(stringToInteger)
  @IsInt()
  @IsOptional()
  RABBIT_MQ_MIN_CONNECTIONS: number = 2;

  /**
   * RabbitMQ Pool 中的最大連線數
   */
  @Expose()
  @Transform(stringToInteger)
  @IsInt()
  @IsOptional()
  RABBIT_MQ_MAX_CONNECTIONS: number = 10;

  /**
   * RabbitMQ Pool 中的連線取得逾時時間 (毫秒)
   */
  @Expose()
  @Transform(stringToInteger)
  @IsInt()
  @IsOptional()
  RABBIT_MQ_ACQUIRE_TIMEOUT_MS: number = 10000;

  /**
   * RabbitMQ Pool 中的閒置連線逾時時間 (毫秒)
   */
  @Expose()
  @Transform(stringToInteger)
  @IsInt()
  @IsOptional()
  RABBIT_MQ_IDLE_TIMEOUT_MS: number = 30000;

  /**
   * RabbitMQ 預設的 Prefetch 數量
   *
   * @see https://amqp-node.github.io/amqplib/channel_api.html#channel_prefetch
   */
  @Expose()
  @Transform(stringToInteger)
  @IsInt()
  @IsOptional()
  RABBIT_MQ_DEFAULT_PREFETCH: number = 100;
}
