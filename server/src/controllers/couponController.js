import Coupon from '../models/Coupon.js';
import asyncHandler from '../utils/asyncHandler.js';
import { evaluateCoupon } from '../services/couponService.js';

export const getCoupons = asyncHandler(async (req, res) => {
  const coupons = await Coupon.find().sort({ createdAt: -1 });

  res.json({
    success: true,
    data: coupons,
  });
});

export const createCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.create({
    ...req.body,
    code: req.body.code?.toUpperCase(),
  });

  res.status(201).json({
    success: true,
    message: 'Coupon created successfully',
    data: coupon,
  });
});

export const updateCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findByIdAndUpdate(
    req.params.id,
    {
      ...req.body,
      code: req.body.code?.toUpperCase(),
    },
    { new: true, runValidators: true }
  );

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  res.json({
    success: true,
    message: 'Coupon updated successfully',
    data: coupon,
  });
});

export const deleteCoupon = asyncHandler(async (req, res) => {
  const coupon = await Coupon.findById(req.params.id);

  if (!coupon) {
    res.status(404);
    throw new Error('Coupon not found');
  }

  await coupon.deleteOne();

  res.json({
    success: true,
    message: 'Coupon deleted successfully',
  });
});

export const validateCoupon = asyncHandler(async (req, res) => {
  const code = (req.body.code || req.query.code || '').toUpperCase();
  const subtotal = Number(req.body.subtotal || req.query.subtotal || 0);
  const coupon = await Coupon.findOne({ code });
  const result = evaluateCoupon(coupon, subtotal);

  if (!result.isValid) {
    res.status(400);
    throw new Error(result.reason);
  }

  res.json({
    success: true,
    message: result.reason,
    data: {
      code,
      subtotal,
      discountAmount: result.discountAmount,
    },
  });
});

