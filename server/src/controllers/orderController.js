import Order from '../models/Order.js';
import Product from '../models/Product.js';
import Coupon from '../models/Coupon.js';
import User from '../models/User.js';
import asyncHandler from '../utils/asyncHandler.js';
import { evaluateCoupon } from '../services/couponService.js';
import { buildPaymentSnapshot, normalizePaymentMethod } from '../services/paymentService.js';
import { queueOrderConfirmation } from '../services/emailService.js';
import { ORDER_STATUS, PRODUCT_STATUS, ROLES } from '../constants/roles.js';

const round = (value) => Number(value.toFixed(2));

const buildPricing = (itemsTotal, discountAmount) => {
  const shippingFee = itemsTotal > 999 ? 0 : 99;
  const taxAmount = round(itemsTotal * 0.12);
  const grandTotal = round(itemsTotal + shippingFee + taxAmount - discountAmount);

  return {
    itemsTotal,
    shippingFee,
    taxAmount,
    discountAmount,
    grandTotal,
  };
};

const canAccessOrder = (order, user) => {
  const customerId = order.customer?._id
    ? order.customer._id.toString()
    : order.customer.toString();

  if (user.role === ROLES.ADMIN) return true;
  if (customerId === user._id.toString()) return true;
  return order.items.some((item) => {
    const sellerId = item.seller?._id ? item.seller._id.toString() : item.seller.toString();
    return sellerId === user._id.toString();
  });
};

const buildRequestedItems = (req) => {
  if (Array.isArray(req.body.items) && req.body.items.length) {
    return req.body.items.map((item) => ({
      productId: item.productId || item.product,
      quantity: Number(item.quantity || 1),
    }));
  }

  return req.user.cart.map((item) => ({
    productId: item.product.toString(),
    quantity: item.quantity,
  }));
};

export const createOrder = asyncHandler(async (req, res) => {
  const { shippingAddress, paymentMethod, couponCode } = req.body;
  const requestedItems = buildRequestedItems(req);

  if (!requestedItems.length) {
    res.status(400);
    throw new Error('At least one product is required to place an order');
  }

  if (!shippingAddress?.fullName || !shippingAddress?.line1 || !shippingAddress?.city) {
    res.status(400);
    throw new Error('A valid shipping address is required');
  }

  const productIds = requestedItems.map((item) => item.productId);
  const uniqueProductIds = [...new Set(productIds.map((item) => item.toString()))];
  const products = await Product.find({
    _id: { $in: uniqueProductIds },
    isActive: true,
    status: PRODUCT_STATUS.PUBLISHED,
  });

  if (products.length !== uniqueProductIds.length) {
    res.status(400);
    throw new Error('One or more selected products are unavailable');
  }

  const productMap = new Map(products.map((product) => [product._id.toString(), product]));
  const orderItems = requestedItems.map((item) => {
    const product = productMap.get(item.productId.toString());

    if (!product) {
      throw new Error('Product not found');
    }

    if (product.inventory.stock < item.quantity) {
      throw new Error(`Only ${product.inventory.stock} unit(s) available for ${product.title}`);
    }

    return {
      product: product._id,
      seller: product.seller,
      title: product.title,
      image: product.thumbnail || product.images[0],
      sku: product.inventory.sku,
      quantity: item.quantity,
      unitPrice: product.price,
      lineTotal: round(product.price * item.quantity),
    };
  });

  const itemsTotal = round(orderItems.reduce((sum, item) => sum + item.lineTotal, 0));
  let couponSnapshot = {
    code: '',
    discountType: '',
    discountValue: 0,
  };
  let discountAmount = 0;
  let coupon;

  if (couponCode) {
    coupon = await Coupon.findOne({ code: couponCode.toUpperCase() });
    const couponResult = evaluateCoupon(coupon, itemsTotal);

    if (!couponResult.isValid) {
      res.status(400);
      throw new Error(couponResult.reason);
    }

    discountAmount = couponResult.discountAmount;
    couponSnapshot = {
      code: coupon.code,
      discountType: coupon.discountType,
      discountValue: coupon.amount,
    };
  }

  const order = await Order.create({
    customer: req.user._id,
    items: orderItems,
    pricing: buildPricing(itemsTotal, discountAmount),
    payment: buildPaymentSnapshot(normalizePaymentMethod(paymentMethod)),
    coupon: couponSnapshot,
    shippingAddress,
    fulfillment: {
      status: ORDER_STATUS.PLACED,
      estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    },
  });

  for (const item of orderItems) {
    const product = productMap.get(item.product.toString());
    product.inventory.stock -= item.quantity;
    await product.save();
  }

  if (coupon) {
    coupon.usedCount += 1;
    await coupon.save();
  }

  const user = await User.findById(req.user._id);
  user.cart = [];
  user.stats.totalOrders += 1;
  user.stats.totalSpent = round(user.stats.totalSpent + order.pricing.grandTotal);
  await user.save();

  await queueOrderConfirmation(order);

  const populatedOrder = await Order.findById(order._id)
    .populate('customer', 'firstName lastName email')
    .populate('items.product', 'title slug thumbnail')
    .populate('items.seller', 'firstName lastName sellerProfile.shopName');

  res.status(201).json({
    success: true,
    message: 'Order placed successfully',
    data: populatedOrder,
  });
});

export const getMyOrders = asyncHandler(async (req, res) => {
  const orders = await Order.find({ customer: req.user._id })
    .populate('items.product', 'title slug thumbnail')
    .populate('items.seller', 'firstName lastName sellerProfile.shopName')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: orders,
  });
});

export const getSellerOrders = asyncHandler(async (req, res) => {
  const query =
    req.user.role === ROLES.ADMIN && req.query.sellerId
      ? { 'items.seller': req.query.sellerId }
      : { 'items.seller': req.user._id };

  const orders = await Order.find(query)
    .populate('customer', 'firstName lastName email')
    .populate('items.product', 'title slug thumbnail')
    .populate('items.seller', 'firstName lastName sellerProfile.shopName')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: orders,
  });
});

export const getAllOrders = asyncHandler(async (req, res) => {
  const filter = {};

  if (req.query.status) {
    filter['fulfillment.status'] = req.query.status;
  }

  const orders = await Order.find(filter)
    .populate('customer', 'firstName lastName email')
    .populate('items.seller', 'firstName lastName sellerProfile.shopName')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: orders,
  });
});

export const getOrderById = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('customer', 'firstName lastName email')
    .populate('items.product', 'title slug thumbnail')
    .populate('items.seller', 'firstName lastName sellerProfile.shopName');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!canAccessOrder(order, req.user)) {
    res.status(403);
    throw new Error('You do not have permission to access this order');
  }

  res.json({
    success: true,
    data: order,
  });
});

export const getOrderTracking = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id).populate('customer', 'firstName lastName');

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (!canAccessOrder(order, req.user)) {
    res.status(403);
    throw new Error('You do not have permission to track this order');
  }

  res.json({
    success: true,
    data: {
      orderNumber: order.orderNumber,
      fulfillment: order.fulfillment,
      statusHistory: order.statusHistory,
    },
  });
});

export const updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, trackingId, carrier } = req.body;
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  const isOrderSeller = order.items.some(
    (item) => item.seller.toString() === req.user._id.toString()
  );

  if (req.user.role !== ROLES.ADMIN && !isOrderSeller) {
    res.status(403);
    throw new Error('You do not have permission to update this order');
  }

  if (!Object.values(ORDER_STATUS).includes(status)) {
    res.status(400);
    throw new Error('Invalid order status');
  }

  order.fulfillment.status = status;
  if (trackingId !== undefined) order.fulfillment.trackingId = trackingId;
  if (carrier !== undefined) order.fulfillment.carrier = carrier;
  if (status === ORDER_STATUS.DELIVERED) {
    order.fulfillment.deliveredAt = new Date();
  }

  order.statusHistory.push({
    status,
    note: note || '',
    updatedBy: req.user._id,
    updatedAt: new Date(),
  });

  await order.save();

  res.json({
    success: true,
    message: 'Order status updated successfully',
    data: order,
  });
});

export const cancelOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id);

  if (!order) {
    res.status(404);
    throw new Error('Order not found');
  }

  if (order.customer.toString() !== req.user._id.toString()) {
    res.status(403);
    throw new Error('You do not have permission to cancel this order');
  }

  if (
    [ORDER_STATUS.SHIPPED, ORDER_STATUS.OUT_FOR_DELIVERY, ORDER_STATUS.DELIVERED].includes(
      order.fulfillment.status
    )
  ) {
    res.status(400);
    throw new Error('This order can no longer be cancelled');
  }

  order.fulfillment.status = ORDER_STATUS.CANCELLED;
  order.statusHistory.push({
    status: ORDER_STATUS.CANCELLED,
    note: req.body.note || 'Cancelled by customer',
    updatedBy: req.user._id,
    updatedAt: new Date(),
  });

  for (const item of order.items) {
    const product = await Product.findById(item.product);
    if (product) {
      product.inventory.stock += item.quantity;
      await product.save();
    }
  }

  await order.save();

  res.json({
    success: true,
    message: 'Order cancelled successfully',
    data: order,
  });
});
