import { AnyZodObject } from 'zod';
import { NextFunction, Request, Response } from 'express';
import { HttpError } from '../utils/httpError';

export const validateBody = (schema: AnyZodObject) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      throw new HttpError(422, 'Validation failed', result.error.flatten());
    }

    req.body = result.data;
    next();
  };
};

export const validateQuery = (schema: AnyZodObject) => {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const result = schema.safeParse({ ...req.query });

    if (!result.success) {
      throw new HttpError(422, 'Invalid query parameters', result.error.flatten());
    }

    req.query = result.data;
    next();
  };
};
