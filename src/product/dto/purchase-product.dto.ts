import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt, Min } from 'class-validator';

export class PurchaseProductDto {
  @Expose()
  @ApiProperty({ description: '產品庫存數量' })
  @IsInt()
  @Min(0)
  quantity: number;
}
