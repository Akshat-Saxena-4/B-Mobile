import logger from '../utils/logger.js';

export const queueOrderConfirmation = async (order) => {
  logger.info(`Queued order confirmation for ${order.orderNumber}`);
};

