import User from '../models/User.js';
import Product from '../models/Product.js';
import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ORDER_STATUS, ROLES, SELLER_STATUS } from '../constants/roles.js';

const getMonthBuckets = (count = 6) => {
  const buckets = [];

  for (let index = count - 1; index >= 0; index -= 1) {
    const date = new Date();
    date.setMonth(date.getMonth() - index);
    buckets.push({
      key: `${date.getFullYear()}-${date.getMonth()}`,
      label: date.toLocaleString('en-US', { month: 'short' }),
      value: 0,
    });
  }

  return buckets;
};

const mapMonthlySeries = (orders, valueSelector) => {
  const buckets = getMonthBuckets();
  const bucketMap = new Map(buckets.map((item) => [item.key, item]));

  orders.forEach((order) => {
    const createdAt = new Date(order.createdAt);
    const key = `${createdAt.getFullYear()}-${createdAt.getMonth()}`;
    const bucket = bucketMap.get(key);
    if (bucket) {
      bucket.value += valueSelector(order);
    }
  });

  return buckets.map((bucket) => ({
    label: bucket.label,
    value: Number(bucket.value.toFixed(2)),
  }));
};

const getCurrentMonthRange = () => {
  const start = new Date();
  start.setDate(1);
  start.setHours(0, 0, 0, 0);

  const end = new Date(start);
  end.setMonth(end.getMonth() + 1);

  return { start, end };
};

export const getShopkeeperDashboard = asyncHandler(async (req, res) => {
  const userId = req.user._id.toString();
  const products = await Product.find({ seller: userId }).sort({ createdAt: -1 });
  const orders = await Order.find({ 'items.seller': userId })
    .populate('customer', 'firstName lastName email')
    .sort({ createdAt: -1 });

  const revenue = orders.reduce((sum, order) => {
    const sellerRevenue = order.items
      .filter((item) => item.seller.toString() === userId)
      .reduce((lineTotal, item) => lineTotal + item.lineTotal, 0);
    return sum + sellerRevenue;
  }, 0);

  const lowStockProducts = products.filter(
    (product) => product.inventory.stock <= product.inventory.lowStockThreshold
  );

  const topProductMap = new Map();
  orders.forEach((order) => {
    order.items
      .filter((item) => item.seller.toString() === userId)
      .forEach((item) => {
        const current = topProductMap.get(item.product.toString()) || {
          title: item.title,
          quantitySold: 0,
          revenue: 0,
        };
        current.quantitySold += item.quantity;
        current.revenue += item.lineTotal;
        topProductMap.set(item.product.toString(), current);
      });
  });

  const topProducts = Array.from(topProductMap.values())
    .sort((left, right) => right.quantitySold - left.quantitySold)
    .slice(0, 5)
    .map((item) => ({
      ...item,
      revenue: Number(item.revenue.toFixed(2)),
    }));

  res.json({
    success: true,
    data: {
      stats: {
        products: products.length,
        activeProducts: products.filter((product) => product.isActive).length,
        orders: orders.length,
        revenue: Number(revenue.toFixed(2)),
        lowStock: lowStockProducts.length,
      },
      monthlySales: mapMonthlySeries(orders, (order) =>
        order.items
          .filter((item) => item.seller.toString() === userId)
          .reduce((sum, item) => sum + item.lineTotal, 0)
      ),
      topProducts,
      recentOrders: orders.slice(0, 5),
      inventoryAlerts: lowStockProducts.slice(0, 5),
    },
  });
});

export const getAdminDashboard = asyncHandler(async (req, res) => {
  const [users, products, orders] = await Promise.all([
    User.find().select('-password').sort({ createdAt: -1 }),
    Product.find().sort({ createdAt: -1 }),
    Order.find().populate('customer', 'firstName lastName email').sort({ createdAt: -1 }),
  ]);

  const activeOrders = orders.filter((order) => order.fulfillment.status !== ORDER_STATUS.CANCELLED);
  const revenue = activeOrders.reduce((sum, order) => sum + order.pricing.grandTotal, 0);
  const { start, end } = getCurrentMonthRange();
  const currentMonthSales = activeOrders
    .filter((order) => {
      const createdAt = new Date(order.createdAt);
      return createdAt >= start && createdAt < end;
    })
    .reduce((sum, order) => sum + order.pricing.grandTotal, 0);

  res.json({
    success: true,
    data: {
      stats: {
        users: users.filter((user) => user.role === ROLES.CUSTOMER).length,
        shopkeepers: users.filter((user) => user.role === ROLES.SHOPKEEPER).length,
        pendingSellers: users.filter(
          (user) => user.sellerProfile?.status === SELLER_STATUS.PENDING
        ).length,
        products: products.length,
        orders: orders.length,
        revenue: Number(revenue.toFixed(2)),
        currentMonthSales: Number(currentMonthSales.toFixed(2)),
      },
      currentMonthLabel: start.toLocaleString('en-US', { month: 'long', year: 'numeric' }),
      monthlyRevenue: mapMonthlySeries(
        activeOrders,
        (order) => order.pricing.grandTotal
      ),
      recentOrders: orders.slice(0, 6),
      sellerQueue: users
        .filter((user) => user.sellerProfile?.status === SELLER_STATUS.PENDING)
        .slice(0, 6),
      userSplit: {
        customers: users.filter((user) => user.role === ROLES.CUSTOMER).length,
        shopkeepers: users.filter((user) => user.role === ROLES.SHOPKEEPER).length,
        admins: users.filter((user) => user.role === ROLES.ADMIN).length,
      },
    },
  });
});
