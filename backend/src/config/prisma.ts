import { PrismaClient } from '@prisma/client';
import { env } from './env';

const logLevels: Array<'query' | 'info' | 'warn' | 'error'> =
  env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['warn', 'error'];

export const prisma = new PrismaClient({
  log: logLevels
});
