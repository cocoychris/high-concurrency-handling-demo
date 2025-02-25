import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { ProductDto } from './dto/product.dto';
import { PurchaseProductDto } from './dto/purchase-product.dto';
import { CacheService } from 'src/cache/cache.service';
import { DrizzleService } from 'src/drizzle/drizzle.service';
import { products } from './entities/product.entity';
import * as fs from 'fs';
import * as path from 'path';
import { QueueService } from 'src/queue/queue.service';
import { Purchase } from './interface/purchase.interface';

const PRODUCT_FIELD_STOCK = 'stock';
const DEDUCT_STOCK_SCRIPT = loadLuaScript('./lua/deduct-stock.lua');
const PURCHASE_QUEUE = 'purchase';
const PURCHASE_QUEUE_PREFETCH = 100;

@Injectable()
export class ProductService implements OnModuleInit {
  private readonly logger: Logger = new Logger(this.constructor.name);
  public static readonly PURCHASE_QUEUE = PURCHASE_QUEUE;
  public static readonly PURCHASE_QUEUE_PREFETCH = PURCHASE_QUEUE_PREFETCH;

  constructor(
    private readonly cache: CacheService,
    private readonly queue: QueueService,
    private readonly drizzle: DrizzleService,
  ) {}
  async onModuleInit() {
    await this.queue.assertQueue(PURCHASE_QUEUE, PURCHASE_QUEUE_PREFETCH);
  }
  /**
   * 設置產品及其庫存數量
   */
  async set(id: number, dto: ProductDto): Promise<void> {
    // 存入資料庫
    await this.drizzle
      .insert(products)
      .values({
        id,
        ...dto,
      })
      .onConflictDoUpdate({
        target: products.id,
        set: dto,
      })
      .execute();
    // 存入快取
    await this.cache.hSet(
      productKey(id),
      PRODUCT_FIELD_STOCK,
      String(dto.stock),
    );
  }
  /**
   * 取得產品資訊(庫存數量)
   */
  async get(id: number): Promise<ProductDto | null> {
    const value = await this.cache.hGet(productKey(id), PRODUCT_FIELD_STOCK);
    if (!value) {
      return null;
    }
    return {
      stock: Number(value),
    };
  }
  /**
   * 購買產品
   */
  async purchase(id: number, dto: PurchaseProductDto): Promise<boolean> {
    // 檢查庫存，若有庫存則扣除庫存並傳回 true
    const newStock = await this.cache.eval(DEDUCT_STOCK_SCRIPT, {
      keys: [productKey(id)],
      arguments: [PRODUCT_FIELD_STOCK, String(dto.quantity)],
    });
    // 庫存不足
    if (newStock === null) {
      return false;
    }
    if (typeof newStock !== 'number') {
      throw new Error('Redis 傳回值錯誤');
    }
    // 有庫存並已扣庫
    try {
      // 發送 Message
      await this.queue.sendJson<Purchase>(PURCHASE_QUEUE, {
        productId: id,
        quantity: dto.quantity,
        newStock,
      });
      return true;
    } catch (error) {
      this.logger.error(
        `推送已購買 Message Queue 時發生錯誤: ${errorToString(error)}`,
      );
      // 回復庫存
      await this.cache.hIncrBy(
        productKey(id),
        PRODUCT_FIELD_STOCK,
        dto.quantity,
      );
      this.logger.warn(`已回復庫存數量 (quantity: ${dto.quantity})`);
      // 擲回讓全局 Error Handler 自動處理
      throw error;
    }
  }
}

function productKey(id: number) {
  return `product:${id}`;
}

function loadLuaScript(relativePath: string): string {
  const scriptPath = path.join(__dirname, relativePath); // Adjust path as needed
  if (path.extname(scriptPath) !== '.lua') {
    throw new Error('必須為 .lua 檔案');
  }
  return fs.readFileSync(scriptPath, 'utf-8');
}

function errorToString(error: any, useStack: boolean = false): string {
  if (useStack && error.stack) {
    return error.stack;
  }
  return error.message || String(error);
}
