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

/** Home hero fallback tiles when featured API is still empty (image + demo INR). */
export const HOME_HERO_FALLBACK = [
  {
    key: 'hf1',
    title: 'Flagship deals',
    price: 89999,
    image:
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=640&q=85',
    to: '/products?category=Smartphones&subcategory=Flagship',
  },
  {
    key: 'hf2',
    title: 'Galaxy & Android',
    price: 64999,
    image:
      'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=640&q=85',
    to: '/products?category=Smartphones&brand=Samsung',
  },
  {
    key: 'hf3',
    title: 'Pixel-perfect',
    price: 96999,
    image:
      'https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=640&q=85',
    to: '/products?category=Smartphones&brand=Google',
  },
];

/** Home spotlight cards → Explore with filters (phone store). */
export const HOME_SPOTLIGHT_LINKS = [
  {
    name: 'Flagship',
    description: 'Latest chipsets, pro cameras, premium builds.',
    to: '/products?category=Smartphones&subcategory=Flagship',
    coverImage:
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Mid-range',
    description: 'Strong daily drivers without flagship tax.',
    to: '/products?category=Smartphones&subcategory=Mid-Range',
    coverImage:
      'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Budget',
    description: 'Big batteries and bright screens for less.',
    to: '/products?category=Smartphones&subcategory=Budget',
    coverImage:
      'https://images.unsplash.com/photo-1556656793-08518206a384?auto=format&fit=crop&w=900&q=85',
  },
  {
    name: 'Foldables',
    description: 'Flexible displays for work and travel.',
    to: '/products?category=Smartphones&subcategory=Foldables',
    coverImage:
      'https://images.unsplash.com/photo-1628744876497-eb30460be9f6?auto=format&fit=crop&w=900&q=85',
  },
];

/** Explore / catalog: sort dropdown + toolbar pills share these values. */
export const CATALOG_SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'priceAsc', label: 'Price ↑' },
  { value: 'priceDesc', label: 'Price ↓' },
  { value: 'rating', label: 'Top rated' },
];

/** One-tap presets for the phone catalog (matches seeded `category` / `subcategory`). */
export const EXPLORE_QUICK_FILTERS = [
  { id: 'all', label: 'All phones', patch: { category: '', subcategory: '', brand: '' } },
  { id: 'flagship', label: 'Flagship', patch: { category: 'Smartphones', subcategory: 'Flagship', brand: '' } },
  { id: 'mid', label: 'Mid-range', patch: { category: 'Smartphones', subcategory: 'Mid-Range', brand: '' } },
  { id: 'budget', label: 'Budget', patch: { category: 'Smartphones', subcategory: 'Budget', brand: '' } },
  { id: 'fold', label: 'Foldables', patch: { category: 'Smartphones', subcategory: 'Foldables', brand: '' } },
  { id: 'apple', label: 'Apple', patch: { category: 'Smartphones', subcategory: '', brand: 'Apple' } },
  { id: 'samsung', label: 'Samsung', patch: { category: 'Smartphones', subcategory: '', brand: 'Samsung' } },
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
