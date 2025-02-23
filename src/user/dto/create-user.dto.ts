import { Expose } from 'class-transformer';
import { CreateUserEntity } from '../entities/user.entity';
import { IsEmail, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

/**
 * 【入境 DTO】範例
 *
 * 「入境 DTO」用於定義 API 的資料**接收**格式。並負責將傳入的資料轉換為所需格式。
 * 由於來源資料的型別未知，我們必須先進行「執行階段」的型別檢查，確保資料型別與 TypeScript 定義相符，
 * 然後才能由 TypeScript 接手，在「編譯階段」確保系統內部處理資料時的型別正確。
 *
 * 它該做的事：
 * - ✅ Swagger API 文件產生：藉由使用 `@nestjs/swagger` 的 `@ApiProperty()` 裝飾器，產生 Swagger API 文件。
 * - ✅ 資料轉換：藉由使用 `class-transformer` 的 `@Expose()` 及 `@Transform()` 裝飾器，將 Entity 轉換成 DTO。
 * - ✅「執行階段」型別檢查：藉由使用 `class-validator` 裝飾器如  `@IsInt()`、`@IsString()` 等實作型別檢查。
 * - ✅「編譯階段」型別檢查：藉由定義 `class` 讓 TypeScript 幫忙檢查型別。
 *
 * 小提示：
 * - 💡 `class DTO implements Entity` 的寫法可確保 DTO 與 Entity 之間的一致性。
 * - 💡 如有部分欄位 (如 `data` 及 `isAdmin` 欄位) 型別不同，則可寫成：
 *    `class DTO implements Omit<Entity, 'data' | 'isAdmin'>`。
 */
export class CreateUserDto implements CreateUserEntity {
  @Expose()
  @ApiProperty({
    description: '使用者的電子郵件',
    example: 'snoopy@example.com',
  })
  @IsEmail()
  email: string;

  @Expose()
  @ApiProperty({
    description: '使用者的角色 ID',
  })
  @IsNumber()
  roleId: number;
}
