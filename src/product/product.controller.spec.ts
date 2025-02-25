import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './product.service';
import { ProductDto } from './dto/product.dto';
import { PurchaseProductDto } from './dto/purchase-product.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { INestApplication } from '@nestjs/common';

import * as supertest from 'supertest';
const request = supertest.default;

describe('ProductController', () => {
  let controller: ProductController;
  let service: ProductService;
  let app: INestApplication;

  const mockProductService = {
    set: jest.fn(),
    get: jest.fn(),
    purchase: jest.fn(),
    getFromDatabase: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
    app = module.createNestApplication();
    await app.init();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('set', () => {
    it('should call productService.set with correct parameters', async () => {
      const id = 1;
      const dto: ProductDto = { stock: 10 };
      await controller.set(id, dto);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.set).toHaveBeenCalledWith(id, dto);
    });

    it('should return 204 No Content', async () => {
      const id = 1;
      const dto: ProductDto = { stock: 10 };
      return request(app.getHttpServer()) // Correct usage
        .put(`/products/${id}`)
        .send(dto)
        .expect(204);
    });
  });

  describe('get', () => {
    it('should return a product dto', async () => {
      const id = 1;
      const dto: ProductDto = { stock: 10 };
      (service.get as jest.Mock).mockResolvedValue(dto);
      const result = await controller.get(id);
      expect(result).toEqual(dto);
    });

    it('should throw NotFoundException if product is not found', async () => {
      const id = 1;
      (service.get as jest.Mock).mockResolvedValue(null);
      await expect(controller.get(id)).rejects.toThrow(NotFoundException);
    });

    it('should return 200 OK with product data', async () => {
      const id = 1;
      const dto: ProductDto = { stock: 10 };
      (service.get as jest.Mock).mockResolvedValue(dto);
      return request(app.getHttpServer()) // Correct usage
        .get(`/products/${id}`)
        .expect(200)
        .expect(dto);
    });

    it('should return 404 Not Found if product is not found', async () => {
      const id = 1;
      (service.get as jest.Mock).mockResolvedValue(null);
      return request(app.getHttpServer()) // Correct usage
        .get(`/products/${id}`)
        .expect(404);
    });
  });

  describe('purchase', () => {
    it('should call productService.purchase with correct parameters', async () => {
      const id = 1;
      const dto: PurchaseProductDto = { quantity: 5 };
      (service.purchase as jest.Mock).mockResolvedValue(true);
      await controller.purchase(id, dto);
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(service.purchase).toHaveBeenCalledWith(id, dto);
    });

    it('should throw ConflictException if purchase fails', async () => {
      const id = 1;
      const dto: PurchaseProductDto = { quantity: 5 };
      (service.purchase as jest.Mock).mockResolvedValue(false);
      await expect(controller.purchase(id, dto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should return 204 No Content on success', async () => {
      const id = 1;
      const dto: PurchaseProductDto = { quantity: 5 };
      (service.purchase as jest.Mock).mockResolvedValue(true);
      return request(app.getHttpServer()) // Correct usage
        .post(`/products/${id}/purchase`)
        .send(dto)
        .expect(204);
    });

    it('should return 409 Conflict on failure', async () => {
      const id = 1;
      const dto: PurchaseProductDto = { quantity: 5 };
      (service.purchase as jest.Mock).mockResolvedValue(false);
      return request(app.getHttpServer()) // Correct usage
        .post(`/products/${id}/purchase`)
        .send(dto)
        .expect(409);
    });
  });

  describe('getFromDatabase', () => {
    it('should return a product dto from database', async () => {
      const id = 1;
      const dto: ProductDto = { stock: 10 };
      (service.getFromDatabase as jest.Mock).mockResolvedValue(dto);
      const result = await controller.getFromDatabase(id);
      expect(result).toEqual(dto);
    });

    it('should throw NotFoundException if product is not found in database', async () => {
      const id = 1;
      (service.getFromDatabase as jest.Mock).mockResolvedValue(null);
      await expect(controller.getFromDatabase(id)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should return 200 OK with product data from database', async () => {
      const id = 1;
      const dto: ProductDto = { stock: 10 };
      (service.getFromDatabase as jest.Mock).mockResolvedValue(dto);
      return request(app.getHttpServer()) // Correct usage
        .get(`/products/${id}/from-db`)
        .expect(200)
        .expect(dto);
    });

    it('should return 404 Not Found if product is not found in database', async () => {
      const id = 1;
      (service.getFromDatabase as jest.Mock).mockResolvedValue(null);
      return request(app.getHttpServer()) // Correct usage
        .get(`/products/${id}/from-db`)
        .expect(404);
    });
  });
});
