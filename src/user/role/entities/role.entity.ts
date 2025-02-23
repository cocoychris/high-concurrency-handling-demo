import { InferInsertModel, InferSelectModel } from 'drizzle-orm';
import { pgTable, serial, text } from 'drizzle-orm/pg-core';

// 定義 Entity 的資料表 Schema
export const user_role = pgTable('user_role', {
  id: serial('id').primaryKey(), // auto-incrementing primary key field
  name: text('name'),
});

// 產生 Entity 的型別定義
export type CreateRoleEntity = InferInsertModel<typeof user_role>;
export type RoleEntity = InferSelectModel<typeof user_role>;
