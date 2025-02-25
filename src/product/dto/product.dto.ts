import { ApiProperty } from '@nestjs/swagger';
import { Expose } from 'class-transformer';
import { IsInt, Min } from 'class-validator';
import { ProductEntity } from '../entities/product.entity';

export class ProductDto implements Omit<ProductEntity, 'id'> {
  // @Expose()
  // @ApiProperty({ description: '產品名稱' })
  // @IsString()
  // @Length(1, 50)
  // name: string;

  @Expose()
  @ApiProperty({ description: '產品庫存數量' })
  @IsInt()
  @Min(0)
  stock: number;
}
