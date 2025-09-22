import { Router } from 'express';
import {
  createOrderHandler,
  getOrderHandler,
  listAllOrdersHandler,
  listMyOrdersHandler,
  updateOrderStatusHandler
} from '../controllers/order.controller';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware';
import { validateBody } from '../middlewares/validateRequest';
import { createOrderSchema, updateOrderStatusSchema } from '../dtos/order.dto';

export const orderRouter = Router();

orderRouter.use(authenticate);

orderRouter.post('/', validateBody(createOrderSchema), createOrderHandler);
orderRouter.get('/my', listMyOrdersHandler);
orderRouter.get('/:orderId', getOrderHandler);

orderRouter.get('/', authorizeRoles('ADMIN', 'SELLER'), listAllOrdersHandler);
orderRouter.patch('/:orderId/status', authorizeRoles('ADMIN', 'SELLER'), validateBody(updateOrderStatusSchema), updateOrderStatusHandler);
