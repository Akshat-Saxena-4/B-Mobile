/**
 * Demo catalog: real smartphone photography (Unsplash) + INR prices in the style of Amazon.in
 * list/deal pricing. Amounts are indicative for demos only — not live Amazon prices.
 *
 * Run: npm run seed:phones (from repo root) — requires MongoDB.
 */
import mongoose from 'mongoose';
import env from '../config/env.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { ROLES, SELLER_STATUS, PRODUCT_STATUS } from '../constants/roles.js';

const SELLER_EMAIL = 'seed.seller@bmobile.demo';

const u = (id, w = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=85`;

const phones = [
  {
    title: 'Apple iPhone 16 Pro (256 GB) — Natural Titanium',
    shortDescription: 'A18 Pro chip, titanium design, 48 MP Fusion camera system.',
    description:
      'Apple iPhone 16 Pro with Action Camera Control, 4K 120 fps Dolby Vision, and all-day battery. Premium build with USB-C and ProRAW photography.',
    brand: 'Apple',
    category: 'Smartphones',
    subcategory: 'Flagship',
    tags: ['5G', 'iOS', 'Pro'],
    price: 139900,
    compareAtPrice: 149900,
    images: [u('1695048133142-1a20484d2569'), u('1592750475338-74b7b21085ab')],
    specifications: [
      { label: 'Display', value: '6.3" Super Retina XDR' },
      { label: 'Chip', value: 'A18 Pro' },
      { label: 'Storage', value: '256 GB' },
    ],
    inventory: { sku: 'BMOBILE-IP16P-256', stock: 18, lowStockThreshold: 4 },
    isFeatured: true,
  },
  {
    title: 'Samsung Galaxy S24 Ultra 5G (12 GB RAM, 256 GB)',
    shortDescription: '200 MP camera, built-in S Pen, brightest Galaxy display.',
    description:
      'Samsung Galaxy S24 Ultra with Galaxy AI features, titanium frame option colours, and pro-grade nightography. Includes S Pen in the box.',
    brand: 'Samsung',
    category: 'Smartphones',
    subcategory: 'Flagship',
    tags: ['5G', 'Android', 'S Pen'],
    price: 124999,
    compareAtPrice: 134999,
    images: [u('1610945265064-0e34e5519bbf'), u('1511707171634-5f897ff02aa9')],
    specifications: [
      { label: 'Display', value: '6.8" Dynamic AMOLED 2X' },
      { label: 'Camera', value: '200 MP quad rear' },
      { label: 'Battery', value: '5000 mAh' },
    ],
    inventory: { sku: 'BMOBILE-SGS24U-256', stock: 14, lowStockThreshold: 4 },
    isFeatured: true,
  },
  {
    title: 'Google Pixel 9 Pro XL (16 GB RAM, 128 GB)',
    shortDescription: 'Tensor G4, best-take photos, seven years of updates.',
    description:
      'Google Pixel 9 Pro XL with advanced AI editing, superb low-light shots, and pure Android with Pixel-first features.',
    brand: 'Google',
    category: 'Smartphones',
    subcategory: 'Flagship',
    tags: ['5G', 'Android', 'AI'],
    price: 96999,
    compareAtPrice: 109900,
    images: [u('1598327105666-5b89351aff97'), u('1565849904461-04a58ad377e0')],
    specifications: [
      { label: 'Display', value: '6.8" LTPO OLED' },
      { label: 'Chip', value: 'Google Tensor G4' },
      { label: 'OS', value: 'Android 15' },
    ],
    inventory: { sku: 'BMOBILE-PXL9PXL-128', stock: 12, lowStockThreshold: 3 },
    isFeatured: true,
  },
  {
    title: 'OnePlus 13 5G (12 GB RAM, 256 GB)',
    shortDescription: 'Snapdragon 8 Elite, Hasselblad colour, 100W SUPERVOOC.',
    description:
      'OnePlus 13 flagship with ultra-bright ProXDR display, fast charging, and OxygenOS tuned for smooth gaming and multitasking.',
    brand: 'OnePlus',
    category: 'Smartphones',
    subcategory: 'Flagship',
    tags: ['5G', 'Android', 'Fast charge'],
    price: 69999,
    compareAtPrice: 74999,
    images: [u('1601784551446-20c9e07cdbdb'), u('1523205771623-e0faa4d2813d')],
    specifications: [
      { label: 'Display', value: '6.82" LTPO AMOLED' },
      { label: 'RAM', value: '12 GB' },
      { label: 'Charging', value: '100W wired' },
    ],
    inventory: { sku: 'BMOBILE-OP13-256', stock: 22, lowStockThreshold: 5 },
    isFeatured: true,
  },
  {
    title: 'Nothing Phone (3) 5G (12 GB RAM, 256 GB)',
    shortDescription: 'Glyph Interface, transparent design, clean Nothing OS.',
    description:
      'Nothing Phone (3) with distinctive LED glyphs, balanced cameras, and a fast, minimal Android experience.',
    brand: 'Nothing',
    category: 'Smartphones',
    subcategory: 'Mid-Range',
    tags: ['5G', 'Android', 'Design'],
    price: 44999,
    compareAtPrice: 47999,
    images: [u('1574944985070-8f3ebc6b79d2')],
    specifications: [
      { label: 'Display', value: '6.7" LTPO OLED' },
      { label: 'Chip', value: 'Snapdragon 8s Gen 3' },
      { label: 'OS', value: 'Nothing OS' },
    ],
    inventory: { sku: 'BMOBILE-NTH3-256', stock: 28, lowStockThreshold: 6 },
    isFeatured: false,
  },
  {
    title: 'Xiaomi 14 (12 GB RAM, 512 GB)',
    shortDescription: 'Leica optics, Snapdragon 8 Gen 3, compact flagship feel.',
    description:
      'Xiaomi 14 with Leica Summilux lens system, bright AMOLED, and HyperOS for fluid everyday performance.',
    brand: 'Xiaomi',
    category: 'Smartphones',
    subcategory: 'Mid-Range',
    tags: ['5G', 'Android', 'Leica'],
    price: 54999,
    compareAtPrice: 59999,
    images: [u('1523205771623-e0faa4d2813d')],
    specifications: [
      { label: 'Display', value: '6.36" AMOLED' },
      { label: 'Camera', value: 'Leica triple' },
      { label: 'Chip', value: 'Snapdragon 8 Gen 3' },
    ],
    inventory: { sku: 'BMOBILE-MI14-512', stock: 20, lowStockThreshold: 5 },
    isFeatured: false,
  },
  {
    title: 'Samsung Galaxy A55 5G (8 GB RAM, 256 GB)',
    shortDescription: 'Super AMOLED 120 Hz, IP67, Knox security.',
    description:
      'Samsung Galaxy A55 with aluminium frame, vivid 6.6" display, and reliable battery life for daily use.',
    brand: 'Samsung',
    category: 'Smartphones',
    subcategory: 'Mid-Range',
    tags: ['5G', 'Android', 'IP67'],
    price: 36999,
    compareAtPrice: 40999,
    images: [u('1511707171634-5f897ff02aa9')],
    specifications: [
      { label: 'Display', value: '6.6" Super AMOLED 120 Hz' },
      { label: 'Battery', value: '5000 mAh' },
      { label: 'Durability', value: 'IP67' },
    ],
    inventory: { sku: 'BMOBILE-SGA55-256', stock: 36, lowStockThreshold: 8 },
    isFeatured: false,
  },
  {
    title: 'Apple iPhone 13 (128 GB) — Midnight',
    shortDescription: 'A15 Bionic, dual-camera system, all-day battery.',
    description:
      'Apple iPhone 13 remains a bestseller: cinematic mode, bright Super Retina XDR display, and MagSafe accessories support.',
    brand: 'Apple',
    category: 'Smartphones',
    subcategory: 'Mid-Range',
    tags: ['5G', 'iOS', 'Dual camera'],
    price: 52999,
    compareAtPrice: 59900,
    images: [u('1592750475338-74b7b21085ab')],
    specifications: [
      { label: 'Display', value: '6.1" Super Retina XDR' },
      { label: 'Chip', value: 'A15 Bionic' },
      { label: 'Storage', value: '128 GB' },
    ],
    inventory: { sku: 'BMOBILE-IP13-128', stock: 30, lowStockThreshold: 6 },
    isFeatured: false,
  },
  {
    title: 'Motorola Edge 50 Pro 5G (12 GB RAM, 256 GB)',
    shortDescription: 'Curved pOLED 144 Hz, 50 MP camera, 125W TurboPower.',
    description:
      'Motorola Edge 50 Pro with near-stock Android experience, slim design, and fast charging for power users.',
    brand: 'Motorola',
    category: 'Smartphones',
    subcategory: 'Budget',
    tags: ['5G', 'Android', '144Hz'],
    price: 31999,
    compareAtPrice: 35999,
    images: [u('1565849904461-04a58ad377e0')],
    specifications: [
      { label: 'Display', value: '6.7" pOLED 144 Hz' },
      { label: 'Camera', value: '50 MP main' },
      { label: 'Charging', value: '125W TurboPower' },
    ],
    inventory: { sku: 'BMOBILE-MEDGE50P-256', stock: 25, lowStockThreshold: 6 },
    isFeatured: false,
  },
  {
    title: 'Samsung Galaxy Z Flip5 5G (8 GB RAM, 256 GB)',
    shortDescription: 'Foldable clamshell, Flex Window cover display.',
    description:
      'Samsung Galaxy Z Flip5 with improved hinge, hands-free Flex mode, and pocketable foldable design.',
    brand: 'Samsung',
    category: 'Smartphones',
    subcategory: 'Foldables',
    tags: ['5G', 'Android', 'Foldable'],
    price: 89999,
    compareAtPrice: 99999,
    images: [u('1628744876497-eb30460be9f6')],
    specifications: [
      { label: 'Main display', value: '6.7" foldable AMOLED' },
      { label: 'Cover display', value: '3.4" Flex Window' },
      { label: 'Hinge', value: 'Slim Flex' },
    ],
    inventory: { sku: 'BMOBILE-SGZFL5-256', stock: 10, lowStockThreshold: 3 },
    isFeatured: false,
  },
];

async function seed() {
  await mongoose.connect(env.mongoUri);

  let seller = await User.findOne({ email: SELLER_EMAIL });
  if (!seller) {
    seller = await User.create({
      firstName: 'B-Mobile',
      lastName: 'Demo Store',
      email: SELLER_EMAIL,
      phone: '9999999999',
      password: 'DemoSeller@123',
      role: ROLES.SHOPKEEPER,
      sellerProfile: {
        shopName: 'B-Mobile Official Demo',
        gstNumber: '29ABCDE1234F1Z5',
        storeDescription: 'Demo inventory with India-style list pricing.',
        status: SELLER_STATUS.APPROVED,
        approvedAt: new Date(),
      },
    });
    console.log('Created demo seller:', SELLER_EMAIL);
  } else if (seller.sellerProfile?.status !== SELLER_STATUS.APPROVED) {
    seller.sellerProfile = {
      ...seller.sellerProfile,
      shopName: seller.sellerProfile?.shopName || 'B-Mobile Official Demo',
      status: SELLER_STATUS.APPROVED,
      approvedAt: new Date(),
    };
    await seller.save();
    console.log('Updated seller to APPROVED:', SELLER_EMAIL);
  }

  const deleted = await Product.deleteMany({
    'inventory.sku': { $regex: /^BMOBILE-/ },
  });
  if (deleted.deletedCount) {
    console.log(`Removed ${deleted.deletedCount} previous B-Mobile seed products.`);
  }

  for (const row of phones) {
    await Product.create({
      ...row,
      seller: seller._id,
      status: PRODUCT_STATUS.PUBLISHED,
      isActive: true,
      ratings: {
        average: Number((4.2 + Math.random() * 0.75).toFixed(1)),
        count: Math.floor(40 + Math.random() * 400),
      },
    });
  }

  console.log(`Seeded ${phones.length} smartphones (Unsplash photos + demo INR prices).`);
  console.log(`Seller login: ${SELLER_EMAIL} / DemoSeller@123`);
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
