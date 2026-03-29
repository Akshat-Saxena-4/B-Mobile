import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import { ROLES, SELLER_STATUS } from '../constants/roles.js';

const addressSchema = new mongoose.Schema(
  {
    label: { type: String, trim: true },
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true, default: '' },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'India' },
    isDefault: { type: Boolean, default: false },
  },
  { _id: false }
);

const cartItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    quantity: { type: Number, min: 1, default: 1 },
  },
  { _id: false }
);

const sellerProfileSchema = new mongoose.Schema(
  {
    shopName: { type: String, trim: true, default: '' },
    gstNumber: { type: String, trim: true, default: '' },
    storeDescription: { type: String, trim: true, default: '' },
    status: {
      type: String,
      enum: Object.values(SELLER_STATUS),
      default: SELLER_STATUS.PENDING,
    },
    approvedAt: { type: Date },
    rejectionReason: { type: String, trim: true, default: '' },
  },
  { _id: false }
);

const userSchema = new mongoose.Schema(
  {
    firstName: { type: String, required: true, trim: true },
    lastName: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, trim: true, lowercase: true },
    phone: { type: String, trim: true, default: '' },
    password: { type: String, required: true, minlength: 6, select: false },
    avatar: { type: String, default: '' },
    role: {
      type: String,
      enum: Object.values(ROLES),
      default: ROLES.CUSTOMER,
    },
    isActive: { type: Boolean, default: true },
    addresses: [addressSchema],
    wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Product' }],
    cart: [cartItemSchema],
    sellerProfile: { type: sellerProfileSchema, default: () => ({}) },
    stats: {
      totalOrders: { type: Number, default: 0 },
      totalSpent: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (_, ret) => {
        delete ret.password;
        return ret;
      },
    },
  }
);

userSchema.virtual('fullName').get(function fullName() {
  return `${this.firstName} ${this.lastName}`.trim();
});

userSchema.pre('save', async function hashPassword(next) {
  if (!this.isModified('password')) {
    return next();
  }

  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

userSchema.methods.comparePassword = function comparePassword(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;

