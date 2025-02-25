import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { App } from 'supertest/types';
import { ProductDto } from 'src/product/dto/product.dto';
import { AppModule } from 'src/app.module';

import request from 'supertest';
import { QueueService } from 'src/queue/queue.service';
import { SECOND } from 'libs/basic-utils/const/time-const';
import { ProductService } from './product/product.service';

// Wait for the message queue and database to process the requests
const DATABASE_REQUEST_DELAY_IN_MS = 500;
const EACH_REQUEST_DELAY_MS = 1;

describe('ProductController (e2e) - High Concurrency', () => {
  const productId: number = 1;
  const initialStock: number = 5;
  const purchaseQuantity: number = 1;
  const numberOfRequests: number = 1000;

  let app: INestApplication<App>;
  let rejectedRequests: number;
  let fulfilledRequests!: number;
  let databaseDelayMs!: number;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();

    const queue = moduleFixture.get<QueueService>(QueueService);
    await queue.purgeQueue(ProductService.PURCHASE_QUEUE);

    rejectedRequests = 0;
    fulfilledRequests = 0;
    databaseDelayMs = 0;
  });

  it('1. Should set initial product stock', async () => {
    await request(app.getHttpServer())
      .put(`/products/${productId}`)
      .send({ stock: initialStock })
      .expect(204);
  });

  it('2. Should verify initial stock in cache', async () => {
    const cachedProduct: ProductDto = (
      await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200)
    ).body;
    expect(cachedProduct.stock).toBe(initialStock);
  });

  it('3. Should verify initial stock in database', async () => {
    const dbProduct: ProductDto = (
      await request(app.getHttpServer())
        .get(`/products/${productId}/from-db`)
        .expect(200)
    ).body;
    expect(dbProduct.stock).toBe(initialStock);
  });

  it(
    '4. Should simulate concurrent purchases',
    async () => {
      const purchasePromises: Promise<request.Response>[] = [];
      for (let i = 0; i < numberOfRequests; i++) {
        await delay(EACH_REQUEST_DELAY_MS);
        purchasePromises.push(
          request(app.getHttpServer())
            .post(`/products/${productId}/purchase`)
            .send({ quantity: purchaseQuantity }),
        );
      }
      const responseList = await Promise.allSettled(purchasePromises);
      responseList.forEach((response) => {
        // TODO:
        // Still not sure why the request keeps being rejected.
        // Only around 7 requests are fulfilled.
        // Will look into this when I have time.
        // Note by Andrash Yang. 2025-02-25
        if (response.status === 'rejected') {
          if (rejectedRequests < 10) {
            // Log only the first 10 rejected requests for inspection
            console.log(
              `Rejected request: ${JSON.stringify(response.reason, null, 2)}`,
            );
          }
          rejectedRequests++; // At least we know how many requests are rejected
        } else if (response.status === 'fulfilled') {
          fulfilledRequests++; // And how many requests are fulfilled
        }
      });
      databaseDelayMs = DATABASE_REQUEST_DELAY_IN_MS * fulfilledRequests;

      console.log(
        [
          `Summary:`,
          `initialStock: ${initialStock}`,
          `numberOfRequests: ${numberOfRequests}`,
          `rejectedRequests: ${rejectedRequests}`,
          `fulfilledRequests: ${fulfilledRequests}`,
          `databaseDelayMs: ${databaseDelayMs}`,
        ].join('\n'),
      );
    },
    numberOfRequests * EACH_REQUEST_DELAY_MS + 10 * SECOND,
  );

  it('5. Should verify final stock in cache', async () => {
    const finalCachedProduct: ProductDto = (
      await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200)
    ).body;
    const expectedStock = Math.max(
      0,
      initialStock - fulfilledRequests * purchaseQuantity,
    );
    expect(finalCachedProduct.stock).toBe(expectedStock);
    console.log(`finalCachedProduct.stock: ${finalCachedProduct.stock}`);
  });

  it(
    '6. Should verify final stock in database',
    async () => {
      await delay(databaseDelayMs);
      const finalDbProduct: ProductDto = (
        await request(app.getHttpServer())
          .get(`/products/${productId}/from-db`)
          .expect(200)
      ).body;
      const expectedStock = Math.max(
        0,
        initialStock - fulfilledRequests * purchaseQuantity,
      );
      expect(finalDbProduct.stock).toBe(expectedStock);
      console.log(`finalDbProduct.stock: ${finalDbProduct.stock}`);
    },
    databaseDelayMs + 10 * SECOND,
  );
});

async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
