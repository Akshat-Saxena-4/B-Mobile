export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  SHOPKEEPER: 'SHOPKEEPER',
  ADMIN: 'ADMIN',
};

export const PAYMENT_OPTIONS = [
  { value: 'COD', label: 'Cash on Delivery' },
  { value: 'CARD', label: 'Card Payment' },
  { value: 'UPI', label: 'UPI' },
  { value: 'WALLET', label: 'Wallet' },
];

export const ORDER_STATUS_OPTIONS = [
  { value: 'PLACED', label: 'Placed' },
  { value: 'CONFIRMED', label: 'Confirmed' },
  { value: 'PACKED', label: 'Packed' },
  { value: 'SHIPPED', label: 'Shipped' },
  { value: 'OUT_FOR_DELIVERY', label: 'Out for Delivery' },
  { value: 'DELIVERED', label: 'Delivered' },
  { value: 'CANCELLED', label: 'Cancelled' },
];

export const COUPON_TYPE_OPTIONS = [
  { value: 'PERCENTAGE', label: 'Percentage' },
  { value: 'FIXED', label: 'Fixed Amount' },
];

export const ORDER_STEPS = [
  'PLACED',
  'CONFIRMED',
  'PACKED',
  'SHIPPED',
  'OUT_FOR_DELIVERY',
  'DELIVERED',
];

export const CATEGORY_SPOTLIGHT = [
  { name: 'Smart Devices', description: 'Flagship electronics with clean industrial styling.' },
  { name: 'Home Studio', description: 'Furniture and decor designed for calm, modern spaces.' },
  { name: 'Fashion Edit', description: 'Premium daily essentials with elevated textures.' },
  { name: 'Beauty Rituals', description: 'High-trust self-care picks with elegant packaging.' },
];

export const SHOPKEEPER_NAV = [
  { label: 'Overview', path: '/seller/dashboard' },
  { label: 'Add Product', path: '/seller/products/new' },
  { label: 'Manage Products', path: '/seller/products' },
  { label: 'Orders', path: '/seller/orders' },
];

export const ADMIN_NAV = [
  { label: 'Overview', path: '/admin/dashboard' },
  { label: 'Users', path: '/admin/users' },
  { label: 'Products', path: '/admin/products' },
  { label: 'Orders', path: '/admin/orders' },
  { label: 'Coupons', path: '/admin/coupons' },
];
