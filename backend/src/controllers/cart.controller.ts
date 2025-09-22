import { Request, Response } from 'express';
import { addItemToCart, clearCart, getCart, removeItemFromCart, updateCartItem } from '../services/cart.service';
import { AuthenticatedRequest } from '../middlewares/authMiddleware';

export const getCartHandler = async (req: AuthenticatedRequest, res: Response) => {
  const cart = await getCart(req.user!.id);
  res.json({ status: 'success', data: cart });
};

export const addToCartHandler = async (req: AuthenticatedRequest, res: Response) => {
  const { productId, quantity } = req.body as { productId: string; quantity: number };
  const cart = await addItemToCart(req.user!.id, productId, quantity ?? 1);
  res.status(201).json({ status: 'success', data: cart });
};

export const updateCartItemHandler = async (req: AuthenticatedRequest, res: Response) => {
  const { quantity } = req.body as { quantity: number };
  const cart = await updateCartItem(req.user!.id, req.params.productId, quantity);
  res.json({ status: 'success', data: cart });
};

export const removeCartItemHandler = async (req: AuthenticatedRequest, res: Response) => {
  const cart = await removeItemFromCart(req.user!.id, req.params.productId);
  res.json({ status: 'success', data: cart });
};

export const clearCartHandler = async (req: AuthenticatedRequest, res: Response) => {
  const cart = await clearCart(req.user!.id);
  res.json({ status: 'success', data: cart });
};
