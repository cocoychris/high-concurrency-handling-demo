import { Module } from '@nestjs/common';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { PurchaseConsumerService } from './purchase-consumer.service';

@Module({
  controllers: [ProductController],
  providers: [ProductService, PurchaseConsumerService],
})
export class ProductModule {}
