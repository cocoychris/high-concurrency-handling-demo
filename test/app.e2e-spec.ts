import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import { App } from 'supertest/types';
import { AppModule } from './../src/app.module';
import { ProductDto } from '../src/product/dto/product.dto';
import { PurchaseProductDto } from '../src/product/dto/purchase-product.dto';

import * as supertest from 'supertest';
const request = supertest.default;

describe('ProductController (e2e) - High Concurrency', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('High concurrency purchase test', async () => {
    const productId = 1;
    const initialStock = 200;
    const purchaseQuantity = 1;
    const numberOfRequests = 500;

    // 1. Put product: id = 1, stock = 2000
    await request(app.getHttpServer())
      .put(`/products/${productId}`)
      .send({ stock: initialStock })
      .expect(204);

    // 2. Get product from cache, check if value is correct
    const cachedProduct: ProductDto = (
      await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200)
    ).body;
    expect(cachedProduct.stock).toBe(initialStock);

    // 3. Get product stock from database, check if value is correct
    const dbProduct: ProductDto = (
      await request(app.getHttpServer())
        .get(`/products/${productId}/from-db`)
        .expect(200)
    ).body;
    expect(dbProduct.stock).toBe(initialStock);

    // 4. Start concurrent purchase with 5000 requests in a batch
    const purchasePromises: Promise<request.Response>[] = [];
    for (let i = 0; i < numberOfRequests; i++) {
      purchasePromises.push(
        request(app.getHttpServer())
          .post(`/products/${productId}/purchase`)
          .send({ quantity: purchaseQuantity }),
      );
    }

    await Promise.allSettled(purchasePromises);

    // 5. Get product from cache, check if value is correct (not over saled)
    const finalCachedProduct: ProductDto = (
      await request(app.getHttpServer())
        .get(`/products/${productId}`)
        .expect(200)
    ).body;

    // 6. Get product from database, check if value is correct (not over saled)
    const finalDbProduct: ProductDto = (
      await request(app.getHttpServer())
        .get(`/products/${productId}/from-db`)
        .expect(200)
    ).body;

    const expectedStock = Math.max(
      0,
      initialStock - numberOfRequests * purchaseQuantity,
    );

    expect(finalCachedProduct.stock).toBe(expectedStock);
    expect(finalDbProduct.stock).toBe(expectedStock);
  }, 20000); // Increase timeout for long-running test
});
