import { createApp } from './app';
import { env } from './config/env';
import { logger } from './config/logger';
import { prisma } from './config/prisma';

const app = createApp();

const server = app.listen(env.PORT, () => {
  logger.info(`API listening on port ${env.PORT}`);
});

const shutdown = async (signal: string) => {
  logger.info({ signal }, 'Shutting down server');
  server.close(async () => {
    await prisma.$disconnect();
    process.exit(0);
  });
};

['SIGTERM', 'SIGINT'].forEach((signal) => {
  process.on(signal, () => void shutdown(signal));
});
