export const evaluateCoupon = (coupon, subtotal) => {
  if (!coupon) {
    return {
      isValid: false,
      discountAmount: 0,
      reason: 'Coupon not found',
    };
  }

  const now = new Date();

  if (!coupon.isActive) {
    return { isValid: false, discountAmount: 0, reason: 'Coupon is inactive' };
  }

  if (coupon.startsAt > now || coupon.expiresAt < now) {
    return { isValid: false, discountAmount: 0, reason: 'Coupon is not valid at this time' };
  }

  if (coupon.usageLimit > 0 && coupon.usedCount >= coupon.usageLimit) {
    return { isValid: false, discountAmount: 0, reason: 'Coupon usage limit reached' };
  }

  if (subtotal < coupon.minOrderValue) {
    return {
      isValid: false,
      discountAmount: 0,
      reason: `Minimum order value is ${coupon.minOrderValue}`,
    };
  }

  let discountAmount = 0;

  if (coupon.discountType === 'PERCENTAGE') {
    discountAmount = (subtotal * coupon.amount) / 100;
    if (coupon.maxDiscount > 0) {
      discountAmount = Math.min(discountAmount, coupon.maxDiscount);
    }
  } else {
    discountAmount = coupon.amount;
  }

  return {
    isValid: true,
    discountAmount: Number(discountAmount.toFixed(2)),
    reason: 'Coupon applied successfully',
  };
};

