import { Response } from 'express';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';
import { getSellerInventory } from '../services/seller.service';

export const getSellerInventoryHandler = async (_req: AuthenticatedRequest, res: Response) => {
  const inventory = await getSellerInventory();
  res.json({ status: 'success', data: inventory });
};
