import { Router } from 'express';
import {
  addToCartHandler,
  clearCartHandler,
  getCartHandler,
  removeCartItemHandler,
  updateCartItemHandler
} from '../controllers/cart.controller';
import { authenticate } from '../middlewares/authMiddleware';

export const cartRouter = Router();

cartRouter.use(authenticate);
cartRouter.get('/', getCartHandler);
cartRouter.post('/', addToCartHandler);
cartRouter.patch('/:productId', updateCartItemHandler);
cartRouter.delete('/:productId', removeCartItemHandler);
cartRouter.delete('/', clearCartHandler);
