import { Response } from 'express';
import {
  createOrder,
  getOrderById,
  getOrderMetrics,
  listAllOrders,
  listOrdersForUser,
  updateOrderStatus
} from '../services/order.service';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const createOrderHandler = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const result = await createOrder(userId, req.body);
  res.status(201).json({ status: 'success', data: result });
};

export const listMyOrdersHandler = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const orders = await listOrdersForUser(userId);
  res.json({ status: 'success', data: orders });
};

export const getOrderHandler = async (req: AuthenticatedRequest, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;
  const order = await getOrderById(req.params.orderId, userId, role);
  res.json({ status: 'success', data: order });
};

export const listAllOrdersHandler = async (_req: AuthenticatedRequest, res: Response) => {
  const orders = await listAllOrders();
  res.json({ status: 'success', data: orders });
};

export const updateOrderStatusHandler = async (req: AuthenticatedRequest, res: Response) => {
  const order = await updateOrderStatus(req.params.orderId, req.body);
  res.json({ status: 'success', data: order });
};

export const getOrderMetricsHandler = async (_req: AuthenticatedRequest, res: Response) => {
  const metrics = await getOrderMetrics();
  res.json({ status: 'success', data: metrics });
};
