export const ROLES = {
  CUSTOMER: 'CUSTOMER',
  SHOPKEEPER: 'SHOPKEEPER',
  ADMIN: 'ADMIN',
};

export const PAYMENT_OPTIONS = [
  { value: 'COD', label: 'Cash on Delivery' },
  { value: 'STORE_PICKUP', label: 'Reserve Now, Pay at Store' },
  { value: 'FINANCE_CALLBACK', label: 'Finance Desk Callback' },
];

export const PAYMENT_METHOD_LABELS = Object.fromEntries(
  PAYMENT_OPTIONS.map((option) => [option.value, option.label])
);

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

export const COMPARE_LIMIT = 4;

export const DEVICE_CATEGORY_OPTIONS = [
  { value: '', label: 'All devices' },
  { value: 'Smartphones', label: 'Phones' },
  { value: 'Tablets', label: 'Tablets' },
  { value: 'Laptops', label: 'Laptops' },
];

export const DEVICE_CATEGORY_META = {
  Smartphones: {
    title: 'Phones',
    description: 'Flagships, camera phones, foldables, and value picks with a fast mobile-first checkout flow.',
    accent: 'Pocket-first',
    eyebrow: 'Phone zone',
    to: '/products?category=Smartphones',
  },
  Tablets: {
    title: 'Tablets',
    description: 'Portable work, drawing, reading, and entertainment devices with stylus and keyboard-ready options.',
    accent: 'Desk-to-couch',
    eyebrow: 'Tablet edit',
    to: '/products?category=Tablets',
  },
  Laptops: {
    title: 'Laptops',
    description: 'Thin-and-light productivity machines, creator workstations, and gaming rigs with clearer comparison.',
    accent: 'Power sessions',
    eyebrow: 'Laptop lab',
    to: '/products?category=Laptops',
  },
};

export const DEVICE_FEATURE_CALLOUTS = [
  {
    title: 'Compare before you commit',
    body: 'Pin up to four devices, stack specs side by side, and spot the best value instantly.',
  },
  {
    title: 'Finance and trade-in ready',
    body: 'Preview monthly cost, exchange value, and delivery timing before the checkout step.',
  },
  {
    title: 'Built for every screen',
    body: 'Phone, tablet, and laptop layouts each get their own rhythm with stronger motion and touch-friendly controls.',
  },
];

export const HOME_HERO_FALLBACK = [
  {
    key: 'hf1',
    title: 'Ultra phones with launch offers',
    price: 89999,
    compareAtPrice: 99999,
    image:
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=720&q=85',
    to: '/products?category=Smartphones&subcategory=Flagship',
  },
  {
    key: 'hf2',
    title: 'Keyboard-ready tablets',
    price: 54999,
    compareAtPrice: 62999,
    image:
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=720&q=85',
    to: '/products?category=Tablets',
  },
  {
    key: 'hf3',
    title: 'Creator and gaming laptops',
    price: 124999,
    compareAtPrice: 139999,
    image:
      'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=720&q=85',
    to: '/products?category=Laptops',
  },
];

export const HOME_SPOTLIGHT_LINKS = [
  {
    name: 'Camera phones',
    description: 'Flagship imaging kits, portrait monsters, and creator-first Androids.',
    to: '/products?category=Smartphones&subcategory=Flagship',
    coverImage:
      'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'Study tablets',
    description: 'Portable note-taking, reading, and streaming devices with long battery life.',
    to: '/products?category=Tablets',
    coverImage:
      'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'Gaming laptops',
    description: 'High-refresh displays, dedicated graphics, and cooling built for long sessions.',
    to: '/products?category=Laptops&subcategory=Gaming',
    coverImage:
      'https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=1200&q=85',
  },
  {
    name: 'Workstation picks',
    description: 'Thin-and-light productivity and creator machines for deep work.',
    to: '/products?category=Laptops&subcategory=Creator',
    coverImage:
      'https://images.unsplash.com/photo-1517336714739-489689fd1ca8?auto=format&fit=crop&w=1200&q=85',
  },
];

export const HOME_COLLECTIONS = [
  {
    key: 'phones',
    category: 'Smartphones',
    eyebrow: 'Phone lineup',
    title: 'Pocket-first devices for camera, gaming, and everyday speed.',
    copy: 'Browse foldables, premium iPhones, Android flagships, and budget 5G picks in one streamlined catalog.',
    to: '/products?category=Smartphones',
    cta: 'Shop phones',
  },
  {
    key: 'tablets',
    category: 'Tablets',
    eyebrow: 'Tablet lineup',
    title: 'Big-screen companions for study, sketching, and entertainment.',
    copy: 'Keyboard-ready tablets and stylus-friendly slates with better filters for learning and travel.',
    to: '/products?category=Tablets',
    cta: 'Shop tablets',
  },
  {
    key: 'laptops',
    category: 'Laptops',
    eyebrow: 'Laptop lineup',
    title: 'Creator rigs, office machines, and gaming notebooks with clear trade-offs.',
    copy: 'See performance-first, creator, and premium ultrabook models with easy comparison and finance planning.',
    to: '/products?category=Laptops',
    cta: 'Shop laptops',
  },
];

export const CATALOG_SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'priceAsc', label: 'Price low-high' },
  { value: 'priceDesc', label: 'Price high-low' },
  { value: 'rating', label: 'Top rated' },
];

export const EXPLORE_QUICK_FILTERS = [
  { id: 'all', label: 'All devices', patch: { category: '', subcategory: '', brand: '' } },
  { id: 'phones', label: 'Phones', patch: { category: 'Smartphones', subcategory: '', brand: '' } },
  { id: 'tablets', label: 'Tablets', patch: { category: 'Tablets', subcategory: '', brand: '' } },
  { id: 'laptops', label: 'Laptops', patch: { category: 'Laptops', subcategory: '', brand: '' } },
  {
    id: 'flagship',
    label: 'Flagship phones',
    patch: { category: 'Smartphones', subcategory: 'Flagship', brand: '' },
  },
  {
    id: 'student',
    label: 'Student tablets',
    patch: { category: 'Tablets', subcategory: 'Student', brand: '' },
  },
  {
    id: 'creator',
    label: 'Creator laptops',
    patch: { category: 'Laptops', subcategory: 'Creator', brand: '' },
  },
  {
    id: 'gaming',
    label: 'Gaming laptops',
    patch: { category: 'Laptops', subcategory: 'Gaming', brand: '' },
  },
];

export const COMPARE_SPEC_PRIORITY = [
  'Display',
  'Chip',
  'Processor',
  'Memory',
  'RAM',
  'Storage',
  'Camera',
  'Battery',
  'Charging',
  'Graphics',
  'Weight',
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
