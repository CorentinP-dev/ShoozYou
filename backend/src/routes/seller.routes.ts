import { Router } from 'express';
import { authenticate, authorizeRoles } from '../middlewares/authMiddleware';
import { getSellerInventoryHandler } from '../controllers/seller.controller';

export const sellerRouter = Router();

sellerRouter.use(authenticate, authorizeRoles('SELLER', 'ADMIN'));

sellerRouter.get('/inventory', getSellerInventoryHandler);
