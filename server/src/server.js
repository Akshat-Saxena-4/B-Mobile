import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';
import { seedDemoCatalog } from './services/catalogSeedService.js';
import logger from './utils/logger.js';

const startServer = async () => {
  try {
    await connectDB();

    if (env.seedDemoCatalogOnStart) {
      await seedDemoCatalog({
        overwrite: false,
        onlyIfEmpty: true,
        logger,
      });
    }

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
  } catch (error) {
    logger.error(error.message);
    process.exit(1);
  }
};

startServer();
