import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';

const queueName = 'productPurchase';

describe('QueueService', () => {
  let service: QueueService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [QueueService],
    }).compile();
    await module.init();
    service = module.get<QueueService>(QueueService);
  });

  afterAll(async () => {
    await service.onModuleDestroy();
  });

  it('should produce and consume message', async () => {
    expect(service).toBeDefined();
    const messageCount = 100;
    await produceMessages(service, messageCount);
    const receivedCount = await consumeMessages(service, messageCount);
    expect(receivedCount).toBe(messageCount);
  });
});

// Producer (Simulating high traffic)
async function produceMessages(service: QueueService, count: number) {
  const promiseList: Promise<void>[] = [];
  for (let i = 0; i < count; i++) {
    promiseList.push(service.sendString(queueName, `Message ${i}`));
  }
  return Promise.all(promiseList);
}

// Consumer (Worker)
async function consumeMessages(service: QueueService, maxCount: number) {
  let receivedCount = 0;
  await service.assertQueue(queueName);
  await service.consumeString(queueName, (message, ack) => {
    if (message) {
      receivedCount++;
      ack();
    }
  });
  for (let i = 0; i < 10; i++) {
    if (receivedCount >= maxCount) {
      break;
    }
    await delay(1000);
  }
  return receivedCount;
}

async function delay(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
