import { PAYMENT_METHODS, PAYMENT_STATUS } from '../constants/roles.js';

export const normalizePaymentMethod = (paymentMethod) => {
  if (!paymentMethod || !Object.values(PAYMENT_METHODS).includes(paymentMethod)) {
    return PAYMENT_METHODS.COD;
  }

  return paymentMethod;
};

export const buildPaymentSnapshot = (paymentMethod) => ({
  method: paymentMethod,
  status: PAYMENT_STATUS.PENDING,
  transactionId: '',
});
