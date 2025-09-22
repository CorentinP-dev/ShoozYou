import request from 'supertest';
import { createApp } from '../../src/app';
import * as productService from '../../src/services/product.service';

describe('GET /api/products', () => {
  const app = createApp();

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns products with pagination', async () => {
    const mockResponse = {
      items: [
        {
          id: 'prod-1',
          sku: 'SKU-1',
          name: 'Sneaker',
          description: 'Comfy shoe',
          price: 120.0,
          stock: 10,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ],
      meta: {
        total: 1,
        page: 1,
        limit: 20,
        pages: 1
      }
    };

    jest.spyOn(productService, 'listProducts').mockResolvedValueOnce(mockResponse as any);

    const response = await request(app).get('/api/products');

    expect(response.status).toBe(200);
    expect(response.body.data.items).toHaveLength(1);
    expect(productService.listProducts).toHaveBeenCalledWith(expect.objectContaining({ limit: 20, page: 1 }));
  });
});
