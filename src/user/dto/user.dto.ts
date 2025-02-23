import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { UserEntity } from '../entities/user.entity';

/**
 * 【出境 DTO】範例
 *
 * 「出境 DTO」用於定義 API 的資料**回傳**格式。並負責資料回傳前的資料轉換。
 * 由於資料在出境前已有 TypeScript 提供的「編譯階段」的型別檢查確保其型別，通常不需額外再做「執行階段」型別檢查。
 *
 * 它該做的事：
 * - ✅ Swagger API 文件產生：藉由使用 `@nestjs/swagger` 的 `@ApiProperty()` 裝飾器，產生 Swagger API 文件。
 * - ✅ 資料轉換：藉由使用 `class-transformer` 的 `@Expose()` 及 `@Transform()` 裝飾器，將 Entity 轉換成 DTO。
 * - ✅「編譯階段」型別檢查：藉由定義 `class` 讓 TypeScript 幫忙檢查型別。
 *
 * 它不該做的事：
 * - ⛔「執行階段」型別檢查：藉由使用 `class-validator` 裝飾器如  `@IsInt()`、`@IsString()` 等實作型別檢查。
 *
 * 小提示：
 * - 💡 `class DTO implements Entity` 的寫法可確保 DTO 與 Entity 之間的一致性。
 * - 💡 如有部分欄位 (如 `data` 及 `isAdmin` 欄位) 型別不同，則可寫成：
 *    `class DTO implements Omit<Entity, 'data' | 'isAdmin'>`。
 * - 💡 如果不需要產生 Swagger API 文件，也無資料轉換的需求，可以不建立此 DTO，直接回傳 Entity 即可。
 */
export class UserDto implements UserEntity {
  @Expose()
  @ApiProperty({
    description: '使用者 ID',
    example: 'wawa',
  })
  id: string;

  @Expose()
  @ApiProperty({
    description: '使用者 Email',
    example: 'snoopy@example.com',
  })
  email: string;

  @Expose()
  @ApiProperty({
    description: '使用者角色 ID',
    example: 1,
  })
  roleId: number;
}
