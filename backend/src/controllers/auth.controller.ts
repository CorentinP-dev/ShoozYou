import { Request, Response } from 'express';
import { loginUser, registerUser } from '../services/auth.service';

export const registerHandler = async (req: Request, res: Response) => {
  const result = await registerUser(req.body);
  res.status(201).json({ status: 'success', data: result });
};

export const loginHandler = async (req: Request, res: Response) => {
  const result = await loginUser(req.body);
  res.json({ status: 'success', data: result });
};
