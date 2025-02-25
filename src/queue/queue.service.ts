import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as amqp from 'amqplib';
import {
  Pool as MqPool,
  Options as MqPoolOptions,
  createPool,
} from 'generic-pool';
import { ENV } from 'src/global/constant';

const CONNECTION_OPTIONS: MqPoolOptions = {
  min: ENV.RABBIT_MQ_MIN_CONNECTIONS,
  max: ENV.RABBIT_MQ_MAX_CONNECTIONS,
  acquireTimeoutMillis: ENV.RABBIT_MQ_ACQUIRE_TIMEOUT_MS,
  idleTimeoutMillis: ENV.RABBIT_MQ_IDLE_TIMEOUT_MS,
  // How often to check for idle connections
  evictionRunIntervalMillis: Math.ceil(ENV.RABBIT_MQ_IDLE_TIMEOUT_MS / 4),
};

@Injectable()
export class QueueService implements OnModuleInit, OnModuleDestroy {
  private readonly logger: Logger = new Logger(this.constructor.name);

  private readonly connectionPool: MqPool<amqp.Connection> = createPool(
    {
      create: async () => {
        const connection = await amqp.connect(ENV.RABBIT_MQ_URL);
        connection.on('error', (error) => {
          this.logger.error('Connection error:', error);
        });
        return connection;
      },
      destroy: async (connection: amqp.Connection) => {
        connection.removeAllListeners();
        await connection.close();
      },
    },
    CONNECTION_OPTIONS,
  );

  async onModuleInit() {
    try {
      await this.connectionPool.ready();
      this.logger.log('Connected to RabbitMQ');
    } catch (error) {
      this.logger.error(`Failed to connect to RabbitMQ: ${error}`);
    }
  }

  async onModuleDestroy() {
    this.logger.log('Closing RabbitMQ connection pool...');
    await this.connectionPool.drain();
    await this.connectionPool.clear();
  }

  async assertQueue(queueName: string, prefetch?: number): Promise<boolean> {
    const connection = await this.connectionPool.acquire();
    const channel = await connection.createChannel();
    await channel.assertQueue(queueName, { durable: true });
    await channel.prefetch(prefetch ?? ENV.RABBIT_MQ_DEFAULT_PREFETCH);
    await this.connectionPool.release(connection);
    return true;
  }

  async sendString(queueName: string, message: string | string[]) {
    const messageList = Array.isArray(message) ? message : [message];
    let connection!: amqp.Connection;
    try {
      connection = await this.connectionPool.acquire();
      const channel = await connection.createChannel();
      for (const message of messageList) {
        channel.sendToQueue(queueName, Buffer.from(message), {
          persistent: true,
        });
        this.logger.debug(`Sent message: ${message}`);
      }
      await this.connectionPool.release(connection);
    } catch (error) {
      if (connection) {
        await this.connectionPool.release(connection);
      }
      throw error;
    }
  }

  async consumeString(
    queueName: string,
    callback: (message: string | null, ack: () => void) => void,
  ) {
    let connection!: amqp.Connection;
    try {
      connection = await this.connectionPool.acquire();
      const channel = await connection.createChannel();
      await channel.consume(
        queueName,
        (message: amqp.ConsumeMessage | null) => {
          const ack = () => {
            channel.ack(message as amqp.Message);
            this.logger.debug(`Ack message: ${message?.content.toString()}`);
          };
          callback(message && message.content.toString(), ack);
        },
        { noAck: false },
      );
      await this.connectionPool.release(connection);
    } catch (error) {
      if (connection) {
        await this.connectionPool.release(connection);
      }
      throw error;
    }
  }

  async sendJson<T extends Record<string, any>>(
    queueName: string,
    object: T | T[],
  ) {
    const objectList = Array.isArray(object) ? object : [object];
    const messageList = objectList.map((obj) => JSON.stringify(obj));
    await this.sendString(queueName, messageList);
  }

  async consumeJson<T extends Record<string, any>>(
    queueName: string,
    callback: (object: T | null, ack: () => void) => void,
  ) {
    await this.consumeString(queueName, (message, ack) => {
      callback(message ? JSON.parse(message) : null, ack);
    });
  }

  async purgeQueue(queueName: string) {
    let connection!: amqp.Connection;
    try {
      connection = await this.connectionPool.acquire();
      const channel = await connection.createChannel();

      await channel.purgeQueue(queueName);
      this.logger.debug(`Queue '${queueName}' purged successfully.`);

      await channel.close();
      await this.connectionPool.release(connection);
    } catch (error) {
      this.logger.error('Error purging queue:', error);
      if (connection) {
        await this.connectionPool.release(connection);
      }
    }
  }
}
