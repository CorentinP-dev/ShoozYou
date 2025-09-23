import { Request, Response } from 'express';
import { listBrands, listGenders, listShoeTypes } from '../services/reference.service';

export const listGendersHandler = async (_req: Request, res: Response) => {
  const genders = await listGenders();
  res.json({ status: 'success', data: genders });
};

export const listShoeTypesHandler = async (_req: Request, res: Response) => {
  const shoeTypes = await listShoeTypes();
  res.json({ status: 'success', data: shoeTypes });
};

export const listBrandsHandler = async (_req: Request, res: Response) => {
  const brands = await listBrands();
  res.json({ status: 'success', data: brands });
};
