import mongoose from 'mongoose';

const couponSchema = new mongoose.Schema(
  {
    code: { type: String, required: true, unique: true, trim: true, uppercase: true },
    description: { type: String, trim: true, default: '' },
    discountType: { type: String, enum: ['PERCENTAGE', 'FIXED'], required: true },
    amount: { type: Number, required: true, min: 0 },
    minOrderValue: { type: Number, min: 0, default: 0 },
    maxDiscount: { type: Number, min: 0, default: 0 },
    usageLimit: { type: Number, min: 0, default: 0 },
    usedCount: { type: Number, min: 0, default: 0 },
    startsAt: { type: Date, required: true },
    expiresAt: { type: Date, required: true },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

const Coupon = mongoose.model('Coupon', couponSchema);

export default Coupon;

