import { Router } from 'express';
import {
  createProductHandler,
  deleteProductHandler,
  getProductHandler,
  listProductsHandler,
  updateProductHandler
} from '../controllers/product.controller';
import { validateBody, validateQuery } from '../middlewares/validateRequest';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware';
import { createProductSchema, productFilterSchema, updateProductSchema } from '../dtos/product.dto';

export const productRouter = Router();

productRouter.get('/', validateQuery(productFilterSchema), listProductsHandler);
productRouter.get('/:productId', getProductHandler);

productRouter.post('/', authenticate, authorizeRoles('SELLER', 'ADMIN'), validateBody(createProductSchema), createProductHandler);
productRouter.patch(
  '/:productId',
  authenticate,
  authorizeRoles('SELLER', 'ADMIN'),
  validateBody(updateProductSchema),
  updateProductHandler
);
productRouter.delete('/:productId', authenticate, authorizeRoles('SELLER', 'ADMIN'), deleteProductHandler);
