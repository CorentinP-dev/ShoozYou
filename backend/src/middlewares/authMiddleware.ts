import { NextFunction, Request, Response } from 'express';
import { verifyJwt } from '../utils/jwt';
import { HttpError } from '../utils/httpError';
import { prisma } from '../config/prisma';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    role: string;
  };
}

export const authenticate = async (req: AuthenticatedRequest, _res: Response, next: NextFunction) => {
  const header = req.headers.authorization;
  const token = header?.startsWith('Bearer ') ? header.slice(7) : undefined;

  if (!token) {
    throw new HttpError(401, 'Authentication token is missing');
  }

  try {
    const payload = verifyJwt(token);
    const dbUser = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: { id: true, role: true, active: true }
    });

    if (!dbUser) {
      throw new HttpError(401, 'Account not found');
    }

    if (!dbUser.active) {
      throw new HttpError(403, 'Account is disabled');
    }

    req.user = { id: dbUser.id, role: dbUser.role };
    next();
  } catch (error) {
    if (error instanceof HttpError) {
      throw error;
    }
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
