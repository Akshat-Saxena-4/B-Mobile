import mongoose from 'mongoose';
import { ORDER_STATUS, PAYMENT_METHODS, PAYMENT_STATUS } from '../constants/roles.js';

const addressSchema = new mongoose.Schema(
  {
    fullName: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    line1: { type: String, required: true, trim: true },
    line2: { type: String, trim: true, default: '' },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    postalCode: { type: String, required: true, trim: true },
    country: { type: String, required: true, trim: true, default: 'India' },
  },
  { _id: false }
);

const orderItemSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: 'Product', required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    image: { type: String, required: true },
    sku: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
    lineTotal: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const statusHistorySchema = new mongoose.Schema(
  {
    status: { type: String, required: true, enum: Object.values(ORDER_STATUS) },
    note: { type: String, trim: true, default: '' },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    updatedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const orderSchema = new mongoose.Schema(
  {
    orderNumber: { type: String, unique: true },
    customer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    items: [orderItemSchema],
    pricing: {
      itemsTotal: { type: Number, required: true, min: 0 },
      shippingFee: { type: Number, required: true, min: 0, default: 0 },
      taxAmount: { type: Number, required: true, min: 0, default: 0 },
      discountAmount: { type: Number, required: true, min: 0, default: 0 },
      grandTotal: { type: Number, required: true, min: 0 },
    },
    payment: {
      method: { type: String, required: true, enum: Object.values(PAYMENT_METHODS) },
      status: {
        type: String,
        required: true,
        enum: Object.values(PAYMENT_STATUS),
        default: PAYMENT_STATUS.PENDING,
      },
      transactionId: { type: String, trim: true, default: '' },
    },
    coupon: {
      code: { type: String, trim: true, uppercase: true, default: '' },
      discountType: { type: String, trim: true, default: '' },
      discountValue: { type: Number, min: 0, default: 0 },
    },
    shippingAddress: { type: addressSchema, required: true },
    fulfillment: {
      status: {
        type: String,
        enum: Object.values(ORDER_STATUS),
        default: ORDER_STATUS.PLACED,
      },
      trackingId: { type: String, trim: true, default: '' },
      carrier: { type: String, trim: true, default: '' },
      estimatedDelivery: { type: Date },
      deliveredAt: { type: Date },
    },
    statusHistory: [statusHistorySchema],
  },
  {
    timestamps: true,
  }
);

orderSchema.pre('save', function createOrderNumber(next) {
  if (!this.orderNumber) {
    this.orderNumber = `VLR-${Date.now().toString().slice(-8)}-${Math.floor(Math.random() * 900 + 100)}`;
  }

  if (!this.statusHistory.length) {
    this.statusHistory.push({
      status: this.fulfillment.status,
      note: 'Order placed successfully',
      updatedBy: this.customer,
      updatedAt: new Date(),
    });
  }

  next();
});

const Order = mongoose.model('Order', orderSchema);

export default Order;

