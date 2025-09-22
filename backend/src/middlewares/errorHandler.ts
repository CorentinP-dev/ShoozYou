import { NextFunction, Request, Response } from 'express';
import { logger } from '../config/logger';
import { isHttpError } from '../utils/httpError';

// Global error middleware to normalize error responses
export const errorHandler = (err: unknown, _req: Request, res: Response, _next: NextFunction): void => {
  if (isHttpError(err)) {
    logger.warn({ err }, 'Handled HttpError');
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      details: err.details ?? null
    });
    return;
  }

  logger.error({ err }, 'Unexpected error');
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
};
