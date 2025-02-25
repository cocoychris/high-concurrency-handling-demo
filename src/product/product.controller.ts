import {
  Body,
  ConflictException,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiNoContentResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
} from '@nestjs/swagger';
import { IntIdPipe } from 'libs/basic-utils/pipe/int-id-pipe';
import { ProductDto } from './dto/product.dto';
import { ProductService } from './product.service';
import { PurchaseProductDto } from './dto/purchase-product.dto';

@Controller('products')
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Put(':id')
  @ApiOperation({ summary: '設置產品庫存數量 (僅用於測試前的準備)' })
  @ApiNoContentResponse({ description: '成功設置產品資訊' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async set(
    @Param('id', IntIdPipe) id: number,
    @Body() dto: ProductDto,
  ): Promise<void> {
    await this.productService.set(id, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: '取得產品庫存數量(使用快取)' })
  @ApiOkResponse({ description: '成功取得產品資訊' })
  @ApiNotFoundResponse({ description: '查無產品' })
  @HttpCode(HttpStatus.OK)
  async get(@Param('id', IntIdPipe) id: number): Promise<ProductDto> {
    const dto = await this.productService.get(id);
    if (!dto) {
      throw new NotFoundException(`查無產品 (id: ${id})`);
    }
    return dto;
  }

  @Post(':id/purchase')
  @ApiOperation({ summary: '購買產品' })
  @ApiNoContentResponse({ description: '成功購買產品' })
  @ApiConflictResponse({ description: '庫存不足' })
  @HttpCode(HttpStatus.NO_CONTENT)
  async purchase(
    @Param('id', IntIdPipe) id: number,
    @Body() dto: PurchaseProductDto,
  ): Promise<void> {
    const isSuccess = await this.productService.purchase(id, dto);
    if (!isSuccess) {
      throw new ConflictException('庫存不足');
    }
  }

  @Get(':id/from-db')
  @ApiOperation({
    summary:
      '從資料庫取得產品資訊 (不用快取。用於比較 cache 與 database 的庫存數量)',
  })
  @ApiOkResponse({ description: '成功取得產品資訊' })
  @ApiNotFoundResponse({ description: '查無產品' })
  @HttpCode(HttpStatus.OK)
  async getFromDatabase(
    @Param('id', IntIdPipe) id: number,
  ): Promise<ProductDto> {
    const dto = await this.productService.getFromDatabase(id);
    if (!dto) {
      throw new NotFoundException(`查無產品 (id: ${id})`);
    }
    return dto;
  }
}
