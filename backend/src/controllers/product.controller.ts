import { Request, Response } from 'express';
import { createProduct, deleteProduct, getProductById, listProducts, updateProduct } from '../services/product.service';

export const createProductHandler = async (req: Request, res: Response) => {
  const product = await createProduct(req.body);
  res.status(201).json({ status: 'success', data: product });
};

export const listProductsHandler = async (req: Request, res: Response) => {
  const products = await listProducts(req.query as any);
  res.json({ status: 'success', data: products });
};

export const getProductHandler = async (req: Request, res: Response) => {
  const product = await getProductById(req.params.productId);
  res.json({ status: 'success', data: product });
};

export const updateProductHandler = async (req: Request, res: Response) => {
  const product = await updateProduct(req.params.productId, req.body);
  res.json({ status: 'success', data: product });
};

export const deleteProductHandler = async (req: Request, res: Response) => {
  await deleteProduct(req.params.productId);
  res.status(204).send();
};
