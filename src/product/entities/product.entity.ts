import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { integer, pgTable, serial } from 'drizzle-orm/pg-core';

// 定義 Entity 的資料表 Schema
export const products = pgTable('product', {
  id: serial('id').primaryKey(),
  // name: text('name').notNull(),
  stock: integer('stock').notNull(),
});

// 產生 Entity 的型別定義
export type CreateProductEntity = InferInsertModel<typeof products>;
export type ProductEntity = InferSelectModel<typeof products>;
