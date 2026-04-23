import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';
import { ensureAdminAccount } from './services/adminSeedService.js';
import { seedDemoCatalog } from './services/catalogSeedService.js';
import logger from './utils/logger.js';

const DB_RETRY_DELAY_MS = 15000;

const sleep = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms);
  });

let demoCatalogSeeded = false;

const initializeDatabase = async () => {
  while (true) {
    try {
      await connectDB();
      await ensureAdminAccount({ logger });

      if (env.seedDemoCatalogOnStart && !demoCatalogSeeded) {
        await seedDemoCatalog({
          overwrite: false,
          onlyIfEmpty: true,
          logger,
        });
        demoCatalogSeeded = true;
      }

      return;
    } catch (error) {
      logger.error(error.message);
      logger.info(
        `Retrying MongoDB connection in ${Math.round(DB_RETRY_DELAY_MS / 1000)} seconds`
      );
      await sleep(DB_RETRY_DELAY_MS);
    }
  }
};

const startServer = async () => {
  try {
    const server = app.listen(env.port, '0.0.0.0', () => {
      logger.info(`Server listening on port ${env.port}`);
    });

    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        logger.error(`Port ${env.port} is already in use`);
      } else {
        logger.error(error.message);
      }

      process.exit(1);
    });

    process.on('SIGTERM', () => {
      logger.info('SIGTERM received, closing server gracefully');
      server.close(() => process.exit(0));
    });

    initializeDatabase().catch((error) => {
      logger.error(error.message);
    });
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};

startServer();
