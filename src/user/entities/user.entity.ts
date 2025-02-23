import { InferInsertModel, InferSelectModel, relations } from 'drizzle-orm';
import { integer, pgTable, text, uuid } from 'drizzle-orm/pg-core';
import { user_role } from '../role/entities/role.entity';

// 定義 Entity 的資料表 Schema
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(), // auto-incrementing primary key field
  email: text('email').unique().notNull(),
  roleId: integer('role_id').notNull(),
});

// 定義 Entity 的資料表關聯
export const usersRelations = relations(users, ({ one }) => ({
  user_role: one(user_role, {
    fields: [users.roleId],
    references: [user_role.id],
  }),
}));

// 產生 Entity 的型別定義
export type CreateUserEntity = InferInsertModel<typeof users>;
export type UserEntity = InferSelectModel<typeof users>;

// 匯出子模組的 Entity
export * from '../role/entities/role.entity';
