import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { QueueService } from 'src/queue/queue.service';
import { ProductService } from './product.service';
import { Purchase } from './interface/purchase.interface';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { products } from './entities/product.entity';
import { eq } from 'drizzle-orm';

@Injectable()
export class PurchaseConsumerService implements OnModuleInit {
  private readonly logger: Logger = new Logger(this.constructor.name);
  constructor(
    private readonly queue: QueueService,
    private readonly drizzle: DrizzleService,
  ) {}

  async onModuleInit() {
    await this.queue.assertQueue(
      ProductService.PURCHASE_QUEUE,
      ProductService.PURCHASE_QUEUE_PREFETCH,
    );
    await this.queue.consumeJson<Purchase>(
      ProductService.PURCHASE_QUEUE,
      this._consumePurchase.bind(this),
    );
    this.logger.log('Start consuming purchase queue');
  }
  /**
   * 消費購買訊息
   * 並將最新庫存同步至資料庫
   */
  private async _consumePurchase(purchase: Purchase, ack: () => void) {
    await this.drizzle
      .update(products)
      .set({
        stock: purchase.newStock,
      })
      .where(eq(products.id, purchase.productId))
      .execute();
    ack();
  }
}
