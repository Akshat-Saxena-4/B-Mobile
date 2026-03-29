import { PAYMENT_METHODS, PAYMENT_STATUS } from '../constants/roles.js';

export const normalizePaymentMethod = (paymentMethod) => {
  if (!paymentMethod || !Object.values(PAYMENT_METHODS).includes(paymentMethod)) {
    return PAYMENT_METHODS.COD;
  }

  return paymentMethod;
};

export const buildPaymentSnapshot = (paymentMethod) => ({
  method: paymentMethod,
  status: paymentMethod === PAYMENT_METHODS.COD ? PAYMENT_STATUS.PENDING : PAYMENT_STATUS.PAID,
  transactionId: paymentMethod === PAYMENT_METHODS.COD ? '' : `TXN-${Date.now()}`,
});

