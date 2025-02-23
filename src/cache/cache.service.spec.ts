import { Test, TestingModule } from '@nestjs/testing';
import { CacheService } from './cache.service';

describe('CacheService', () => {
  let service: CacheService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [CacheService],
    }).compile();
    await module.init();
    service = module.get<CacheService>(CacheService);
  });

  afterAll(async () => {
    await service.onModuleDestroy();
  });

  it('should set and get value', async () => {
    expect(service).toBeDefined();
    const key = 'key';
    const field = 'field';
    const value = 'value';
    await service.hSet(key, field, value);
    const result = await service.hGet(key, field);
    expect(result).toBe(value);
  });
});
