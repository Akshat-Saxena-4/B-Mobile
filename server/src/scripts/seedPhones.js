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
  {
    title: 'Google Pixel 8a (8 GB RAM, 128 GB)',
    shortDescription: 'Tensor G3, best-in-class camera bar, seven years of updates.',
    description:
      'Google Pixel 8a delivers the Pixel camera experience in a compact body with bright Actua display and fast wired charging.',
    brand: 'Google',
    category: 'Smartphones',
    subcategory: 'Mid-Range',
    tags: ['5G', 'Android', 'Tensor'],
    price: 43999,
    compareAtPrice: 47999,
    images: [u('1598327105666-5b89351aff97'), u('1580910051074-3eb694886e4f')],
    specifications: [
      { label: 'Display', value: '6.1" Actua OLED' },
      { label: 'Chip', value: 'Google Tensor G3' },
      { label: 'Camera', value: '64 MP dual rear' },
    ],
    inventory: { sku: 'BMOBILE-PXL8A-128', stock: 26, lowStockThreshold: 6 },
    isFeatured: false,
  },
  {
    title: 'Apple iPhone 15 (128 GB) — Blue',
    shortDescription: 'Dynamic Island, A16 Bionic, USB-C, crisp Super Retina XDR.',
    description:
      'Apple iPhone 15 with advanced dual-camera system, all-day battery, and durable colour-infused glass back.',
    brand: 'Apple',
    category: 'Smartphones',
    subcategory: 'Mid-Range',
    tags: ['5G', 'iOS', 'USB-C'],
    price: 65999,
    compareAtPrice: 72900,
    images: [u('1592899678134-aa48cd494c2d'), u('1585060544812-6b45742d762f')],
    specifications: [
      { label: 'Display', value: '6.1" Super Retina XDR' },
      { label: 'Chip', value: 'A16 Bionic' },
      { label: 'Port', value: 'USB-C' },
    ],
    inventory: { sku: 'BMOBILE-IP15-128', stock: 24, lowStockThreshold: 5 },
    isFeatured: false,
  },
  {
    title: 'Samsung Galaxy S23 FE 5G (8 GB RAM, 256 GB)',
    shortDescription: 'Flagship-style camera, 120 Hz AMOLED, IP68, long battery.',
    description:
      'Samsung Galaxy S23 FE balances pro-grade nightography with a vivid display and reliable Exynos or Snapdragon performance by region.',
    brand: 'Samsung',
    category: 'Smartphones',
    subcategory: 'Mid-Range',
    tags: ['5G', 'Android', 'IP68'],
    price: 49999,
    compareAtPrice: 54999,
    images: [u('1610945265064-0e34e5519bbf'), u('1512496015121-78fcb3467509')],
    specifications: [
      { label: 'Display', value: '6.4" Dynamic AMOLED 2X 120 Hz' },
      { label: 'Camera', value: '50 MP triple' },
      { label: 'Durability', value: 'IP68' },
    ],
    inventory: { sku: 'BMOBILE-SGS23FE-256', stock: 31, lowStockThreshold: 7 },
    isFeatured: false,
  },
  {
    title: 'Xiaomi Redmi Note 13 Pro 5G (8 GB RAM, 256 GB)',
    shortDescription: '200 MP main camera, 120W HyperCharge, bright AMOLED.',
    description:
      'Redmi Note 13 Pro 5G with flagship-class charging, vivid curved display, and versatile photography for everyday creators.',
    brand: 'Xiaomi',
    category: 'Smartphones',
    subcategory: 'Mid-Range',
    tags: ['5G', 'Android', 'Fast charge'],
    price: 24999,
    compareAtPrice: 27999,
    images: [u('1511707171634-5f897ff02aa9'), u('1523205771623-e0faa4d2813d')],
    specifications: [
      { label: 'Display', value: '6.67" AMOLED 120 Hz' },
      { label: 'Camera', value: '200 MP OIS main' },
      { label: 'Charging', value: '120W wired' },
    ],
    inventory: { sku: 'BMOBILE-RMN13P-256', stock: 44, lowStockThreshold: 10 },
    isFeatured: false,
  },
  {
    title: 'vivo X100 Pro 5G (16 GB RAM, 512 GB)',
    shortDescription: 'ZEISS optics, V3 chip, flagship portrait and astro modes.',
    description:
      'vivo X100 Pro pairs a large sensor main camera with periscope telephoto and cinematic video tuned with ZEISS colour science.',
    brand: 'vivo',
    category: 'Smartphones',
    subcategory: 'Flagship',
    tags: ['5G', 'Android', 'ZEISS'],
    price: 89999,
    compareAtPrice: 94999,
    images: [u('1601972599680-9a3a89b8eacf'), u('1565849904461-04a58ad377e0')],
    specifications: [
      { label: 'Display', value: '6.78" LTPO AMOLED' },
      { label: 'Camera', value: 'ZEISS triple' },
      { label: 'Chip', value: 'MediaTek Dimensity 9300' },
    ],
    inventory: { sku: 'BMOBILE-VIVOX100P-512', stock: 11, lowStockThreshold: 3 },
    isFeatured: true,
  },
  {
    title: 'OPPO Reno 12 Pro 5G (12 GB RAM, 256 GB)',
    shortDescription: 'Slim design, AI eraser, 80W SUPERVOOC, vibrant OLED.',
    description:
      'OPPO Reno 12 Pro focuses on style and smart photo tools with a lightweight frame and ColorOS refinements.',
    brand: 'OPPO',
    category: 'Smartphones',
    subcategory: 'Mid-Range',
    tags: ['5G', 'Android', 'Fast charge'],
    price: 36999,
    compareAtPrice: 39999,
    images: [u('1574944985070-8f3ebc6b79d2'), u('1601784551446-20c9e07cdbdb')],
    specifications: [
      { label: 'Display', value: '6.7" AMOLED curved' },
      { label: 'Charging', value: '80W SUPERVOOC' },
      { label: 'OS', value: 'ColorOS' },
    ],
    inventory: { sku: 'BMOBILE-OPR12P-256', stock: 19, lowStockThreshold: 5 },
    isFeatured: false,
  },
  {
    title: 'realme GT 6 5G (12 GB RAM, 256 GB)',
    shortDescription: 'Snapdragon 8s Gen 3, 6000 nit peak brightness, 120W charge.',
    description:
      'realme GT 6 targets gamers and power users with a ultra-bright panel, vapor cooling, and rapid top-ups.',
    brand: 'realme',
    category: 'Smartphones',
    subcategory: 'Mid-Range',
    tags: ['5G', 'Android', 'Gaming'],
    price: 34999,
    compareAtPrice: 37999,
    images: [u('1512496015121-78fcb3467509'), u('1556656793-08518206a384')],
    specifications: [
      { label: 'Display', value: '6.78" 8T LTPO' },
      { label: 'Chip', value: 'Snapdragon 8s Gen 3' },
      { label: 'Charging', value: '120W' },
    ],
    inventory: { sku: 'BMOBILE-RMGGT6-256', stock: 23, lowStockThreshold: 6 },
    isFeatured: false,
  },
  {
    title: 'ASUS ROG Phone 8 5G (16 GB RAM, 512 GB)',
    shortDescription: '165 Hz AMOLED, AirTrigger controls, Snapdragon 8 Gen 3.',
    description:
      'ASUS ROG Phone 8 keeps thermals in check for marathon sessions with gamer-first software and optional cooler accessories.',
    brand: 'ASUS',
    category: 'Smartphones',
    subcategory: 'Flagship',
    tags: ['5G', 'Android', 'Gaming'],
    price: 94999,
    compareAtPrice: 99999,
    images: [u('1585060544812-6b45742d762f'), u('1601972599680-9a3a89b8eacf')],
    specifications: [
      { label: 'Display', value: '6.78" 165 Hz AMOLED' },
      { label: 'Chip', value: 'Snapdragon 8 Gen 3' },
      { label: 'Audio', value: 'Dirac-tuned stereo' },
    ],
    inventory: { sku: 'BMOBILE-ASUSR8-512', stock: 9, lowStockThreshold: 2 },
    isFeatured: true,
  },
  {
    title: 'Samsung Galaxy Z Fold5 5G (12 GB RAM, 256 GB)',
    shortDescription: 'Tablet-sized foldable, S Pen ready, multitasking powerhouse.',
    description:
      'Galaxy Z Fold5 refines the book-style fold with a brighter main panel, slim hinge profile, and desktop-class app pairs.',
    brand: 'Samsung',
    category: 'Smartphones',
    subcategory: 'Foldables',
    tags: ['5G', 'Android', 'Foldable'],
    price: 154999,
    compareAtPrice: 164999,
    images: [u('1628744876497-eb30460be9f6'), u('1610945265064-0e34e5519bbf')],
    specifications: [
      { label: 'Main display', value: '7.6" foldable AMOLED' },
      { label: 'Cover display', value: '6.2" HD+' },
      { label: 'Multitask', value: 'App pairs + taskbar' },
    ],
    inventory: { sku: 'BMOBILE-SGZFD5-256', stock: 6, lowStockThreshold: 2 },
    isFeatured: false,
  },
  {
    title: 'Sony Xperia 1 VI (12 GB RAM, 256 GB)',
    shortDescription: '4K OLED 120 Hz, Alpha-inspired camera, pro video tools.',
    description:
      'Sony Xperia 1 VI continues the creator-focused lineage with manual controls, headphone jack, and cinematic colour profiles.',
    brand: 'Sony',
    category: 'Smartphones',
    subcategory: 'Flagship',
    tags: ['5G', 'Android', 'Creator'],
    price: 114999,
    compareAtPrice: 124999,
    images: [u('1580910051074-3eb694886e4f'), u('1592899678134-aa48cd494c2d')],
    specifications: [
      { label: 'Display', value: '6.5" 4K OLED 120 Hz' },
      { label: 'Camera', value: 'ZEISS triple' },
      { label: 'Audio', value: '3.5 mm jack + LDAC' },
    ],
    inventory: { sku: 'BMOBILE-SONYX1VI-256', stock: 8, lowStockThreshold: 2 },
    isFeatured: false,
  },
  {
    title: 'iQOO 12 5G (12 GB RAM, 256 GB)',
    shortDescription: 'Snapdragon 8 Gen 3, Q1 chip, 120W FlashCharge.',
    description:
      'iQOO 12 pairs a tele-periscope camera with esports-grade touch response and OriginOS / Funtouch polish for India.',
    brand: 'iQOO',
    category: 'Smartphones',
    subcategory: 'Flagship',
    tags: ['5G', 'Android', 'Gaming'],
    price: 52999,
    compareAtPrice: 57999,
    images: [u('1523205771623-e0faa4d2813d'), u('1511707171634-5f897ff02aa9')],
    specifications: [
      { label: 'Display', value: '6.78" LTPO AMOLED' },
      { label: 'Chip', value: 'Snapdragon 8 Gen 3' },
      { label: 'Charging', value: '120W FlashCharge' },
    ],
    inventory: { sku: 'BMOBILE-IQOO12-256', stock: 17, lowStockThreshold: 4 },
    isFeatured: false,
  },
  {
    title: 'Lava Agni 3 5G (8 GB RAM, 256 GB)',
    shortDescription: 'Indian design, clean UI, strong battery, value 5G.',
    description:
      'Lava Agni 3 focuses on reliable daily performance with a large display and near-stock Android experience.',
    brand: 'Lava',
    category: 'Smartphones',
    subcategory: 'Budget',
    tags: ['5G', 'Android', 'India'],
    price: 19999,
    compareAtPrice: 22999,
    images: [u('1565849904461-04a58ad377e0'), u('1574944985070-8f3ebc6b79d2')],
    specifications: [
      { label: 'Display', value: '6.67" FHD+ 120 Hz' },
      { label: 'Battery', value: '5000 mAh' },
      { label: 'OS', value: 'Android 14' },
    ],
    inventory: { sku: 'BMOBILE-LAVAAG3-256', stock: 38, lowStockThreshold: 8 },
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
