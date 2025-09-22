import { NextFunction, Request, Response } from 'express';
import { verifyJwt } from '../utils/jwt';
import { HttpError } from '../utils/httpError';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticate = (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    throw new HttpError(401, 'Authentication token is missing');
  }

  try {
    const payload = verifyJwt(token);
    req.user = { id: payload.sub, role: payload.role };
    next();
  } catch (error) {
    throw new HttpError(401, 'Invalid authentication token', error);
  }
};

export const authorizeRoles = (...roles: string[]) => {
  return (req: AuthenticatedRequest, _res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new HttpError(401, 'Unauthenticated');
    }

    if (!roles.includes(req.user.role)) {
      throw new HttpError(403, 'You are not allowed to perform this action');
    }

    next();
  };
};
