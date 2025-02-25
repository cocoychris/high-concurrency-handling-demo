import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { DrizzleModule } from 'src/drizzle/drizzle.module';
import { CacheModule } from 'src/cache/cache.module';
import { QueueModule } from 'src/queue/queue.module';

describe('ProductService', () => {
  let service: ProductService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DrizzleModule, CacheModule, QueueModule],
      providers: [ProductService],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
