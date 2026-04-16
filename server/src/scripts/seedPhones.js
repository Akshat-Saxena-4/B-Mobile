/**
 * Demo catalog: phones, tablets, and laptops with premium marketplace-style copy and INR pricing.
 *
 * Run: npm run seed:phones (from repo root) - requires MongoDB.
 */
import mongoose from 'mongoose';
import env from '../config/env.js';
import User from '../models/User.js';
import Product from '../models/Product.js';
import { PRODUCT_STATUS, ROLES, SELLER_STATUS } from '../constants/roles.js';

const SELLER_EMAIL = 'seed.seller@bmobile.demo';

const u = (id, width = 900) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${width}&q=85`;

const stock = (sku, value, low = 5) => ({
  sku,
  stock: value,
  lowStockThreshold: low,
});

const catalogItems = [
  {
    title: 'Apple iPhone 16 Pro (256 GB) - Natural Titanium',
    shortDescription: 'A18 Pro chip, titanium frame, and a sharper pro camera workflow.',
    description:
      'A flagship iPhone build with premium materials, dependable battery life, and an imaging stack built for creators and everyday premium buyers.',
    brand: 'Apple',
    category: 'Smartphones',
    subcategory: 'Flagship',
    tags: ['5G', 'iOS', 'Camera'],
    price: 139900,
    compareAtPrice: 149900,
    images: [u('1695048133142-1a20484d2569'), u('1592750475338-74b7b21085ab')],
    specifications: [
      { label: 'Display', value: '6.3" Super Retina XDR' },
      { label: 'Chip', value: 'A18 Pro' },
      { label: 'Storage', value: '256 GB' },
      { label: 'Camera', value: '48 MP triple camera' },
    ],
    inventory: stock('BMOBILE-IP16PRO-256', 18, 4),
    isFeatured: true,
  },
  {
    title: 'Samsung Galaxy S24 Ultra 5G (12 GB RAM, 256 GB)',
    shortDescription: 'Galaxy AI, S Pen, and a 200 MP camera system for serious Android buyers.',
    description:
      'A premium Android flagship with top-end zoom, bright AMOLED display, and productivity-first hardware anchored by the integrated S Pen.',
    brand: 'Samsung',
    category: 'Smartphones',
    subcategory: 'Flagship',
    tags: ['5G', 'Android', 'S Pen'],
    price: 124999,
    compareAtPrice: 134999,
    images: [u('1610945265064-0e34e5519bbf'), u('1511707171634-5f897ff02aa9')],
    specifications: [
      { label: 'Display', value: '6.8" Dynamic AMOLED 2X' },
      { label: 'Camera', value: '200 MP quad camera' },
      { label: 'Battery', value: '5000 mAh' },
      { label: 'Charging', value: '45W wired' },
    ],
    inventory: stock('BMOBILE-S24U-256', 14, 4),
    isFeatured: true,
  },
  {
    title: 'Google Pixel 9 Pro XL (16 GB RAM, 128 GB)',
    shortDescription: 'Tensor G4, best-take photo tools, and a clean Google-first Android experience.',
    description:
      'Built for users who care about camera consistency, long software support, and a polished Android experience without extra clutter.',
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
      { label: 'Camera', value: '50 MP triple camera' },
      { label: 'Battery', value: '5060 mAh' },
    ],
    inventory: stock('BMOBILE-PXL9PXL-128', 12, 3),
    isFeatured: true,
  },
  {
    title: 'OnePlus 13 5G (12 GB RAM, 256 GB)',
    shortDescription: 'Fast charging, Snapdragon power, and a smooth OxygenOS experience.',
    description:
      'A fast, premium Android phone tuned for power users, gaming, and users who want flagship speed without the steepest premium.',
    brand: 'OnePlus',
    category: 'Smartphones',
    subcategory: 'Flagship',
    tags: ['5G', 'Android', 'Fast charge'],
    price: 69999,
    compareAtPrice: 74999,
    images: [u('1601784551446-20c9e07cdbdb'), u('1523205771623-e0faa4d2813d')],
    specifications: [
      { label: 'Display', value: '6.82" LTPO AMOLED' },
      { label: 'Chip', value: 'Snapdragon 8 Elite' },
      { label: 'Charging', value: '100W wired' },
      { label: 'Battery', value: '5400 mAh' },
    ],
    inventory: stock('BMOBILE-OP13-256', 22, 5),
    isFeatured: true,
  },
  {
    title: 'Nothing Phone (3) 5G (12 GB RAM, 256 GB)',
    shortDescription: 'Transparent design, glyph lights, and a clean visual identity.',
    description:
      'A design-first Android device that balances performance, clean software, and a distinct look for users who want something different.',
    brand: 'Nothing',
    category: 'Smartphones',
    subcategory: 'Mid-Range',
    tags: ['5G', 'Android', 'Design'],
    price: 44999,
    compareAtPrice: 47999,
    images: [u('1574944985070-8f3ebc6b79d2'), u('1601784551446-20c9e07cdbdb')],
    specifications: [
      { label: 'Display', value: '6.7" LTPO OLED' },
      { label: 'Chip', value: 'Snapdragon 8s Gen 3' },
      { label: 'Storage', value: '256 GB' },
      { label: 'Battery', value: '5000 mAh' },
    ],
    inventory: stock('BMOBILE-NTH3-256', 28, 6),
    isFeatured: false,
  },
  {
    title: 'Samsung Galaxy A55 5G (8 GB RAM, 256 GB)',
    shortDescription: 'Reliable battery life, Samsung polish, and a vivid AMOLED display.',
    description:
      'A strong everyday Android with premium touches, bright visuals, and the kind of brand trust mid-range buyers look for.',
    brand: 'Samsung',
    category: 'Smartphones',
    subcategory: 'Mid-Range',
    tags: ['5G', 'Android', 'AMOLED'],
    price: 36999,
    compareAtPrice: 40999,
    images: [u('1511707171634-5f897ff02aa9'), u('1512496015121-78fcb3467509')],
    specifications: [
      { label: 'Display', value: '6.6" Super AMOLED 120 Hz' },
      { label: 'Camera', value: '50 MP triple camera' },
      { label: 'Battery', value: '5000 mAh' },
      { label: 'Durability', value: 'IP67' },
    ],
    inventory: stock('BMOBILE-A55-256', 36, 8),
    isFeatured: false,
  },
  {
    title: 'Apple iPhone 15 (128 GB) - Blue',
    shortDescription: 'Dynamic Island, USB-C, and dependable iPhone performance in a lighter price band.',
    description:
      'A modern iPhone choice for buyers who want premium software support, polished hardware, and a less extreme flagship price.',
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
      { label: 'Storage', value: '128 GB' },
      { label: 'Camera', value: '48 MP dual camera' },
    ],
    inventory: stock('BMOBILE-IP15-128', 24, 5),
    isFeatured: false,
  },
  {
    title: 'Motorola Edge 50 Pro 5G (12 GB RAM, 256 GB)',
    shortDescription: 'Curved pOLED display, fast charging, and clean software for value seekers.',
    description:
      'A sharp value device for buyers who prioritize charging speed, display quality, and a cleaner Android experience.',
    brand: 'Motorola',
    category: 'Smartphones',
    subcategory: 'Budget',
    tags: ['5G', 'Android', 'Value'],
    price: 31999,
    compareAtPrice: 35999,
    images: [u('1565849904461-04a58ad377e0'), u('1574944985070-8f3ebc6b79d2')],
    specifications: [
      { label: 'Display', value: '6.7" pOLED 144 Hz' },
      { label: 'Camera', value: '50 MP OIS main' },
      { label: 'Charging', value: '125W TurboPower' },
      { label: 'Battery', value: '4500 mAh' },
    ],
    inventory: stock('BMOBILE-EDGE50PRO-256', 25, 6),
    isFeatured: false,
  },
  {
    title: 'Samsung Galaxy Z Flip5 5G (8 GB RAM, 256 GB)',
    shortDescription: 'Pocketable foldable with Flex Window utility and a premium feel.',
    description:
      'A foldable built for users who want a standout form factor, better pocketability, and camera flexibility for everyday social use.',
    brand: 'Samsung',
    category: 'Smartphones',
    subcategory: 'Foldables',
    tags: ['5G', 'Android', 'Foldable'],
    price: 89999,
    compareAtPrice: 99999,
    images: [u('1628744876497-eb30460be9f6'), u('1610945265064-0e34e5519bbf')],
    specifications: [
      { label: 'Display', value: '6.7" Foldable AMOLED' },
      { label: 'Cover display', value: '3.4" Flex Window' },
      { label: 'Battery', value: '3700 mAh' },
      { label: 'Storage', value: '256 GB' },
    ],
    inventory: stock('BMOBILE-ZFLIP5-256', 10, 3),
    isFeatured: false,
  },
  {
    title: 'Samsung Galaxy Z Fold5 5G (12 GB RAM, 256 GB)',
    shortDescription: 'Phone-to-tablet transformation with multitasking power and premium build quality.',
    description:
      'For buyers who want a work-and-play foldable with serious multitasking, app pairing, and tablet-like inner-screen productivity.',
    brand: 'Samsung',
    category: 'Smartphones',
    subcategory: 'Foldables',
    tags: ['5G', 'Android', 'Foldable'],
    price: 154999,
    compareAtPrice: 164999,
    images: [u('1628744876497-eb30460be9f6'), u('1512496015121-78fcb3467509')],
    specifications: [
      { label: 'Display', value: '7.6" Foldable AMOLED' },
      { label: 'Cover display', value: '6.2" AMOLED' },
      { label: 'Memory', value: '12 GB RAM' },
      { label: 'Storage', value: '256 GB' },
    ],
    inventory: stock('BMOBILE-ZFOLD5-256', 6, 2),
    isFeatured: false,
  },
  {
    title: 'Apple iPad Pro 13 (M4, 256 GB, Wi-Fi)',
    shortDescription: 'Ultra-thin flagship tablet with OLED display and desktop-class chip power.',
    description:
      'A premium tablet built for creators, professionals, and buyers who want the highest-end Apple tablet experience available.',
    brand: 'Apple',
    category: 'Tablets',
    subcategory: 'Creator',
    tags: ['Tablet', 'iPadOS', 'Creator'],
    price: 129900,
    compareAtPrice: 139900,
    images: [u('1544244015-0df4b3ffc6b0'), u('1517336714739-489689fd1ca8')],
    specifications: [
      { label: 'Display', value: '13" Ultra Retina XDR OLED' },
      { label: 'Chip', value: 'Apple M4' },
      { label: 'Storage', value: '256 GB' },
      { label: 'Battery', value: 'Up to 10 hours' },
    ],
    inventory: stock('BMOBILE-IPADPRO13-256', 11, 3),
    isFeatured: true,
  },
  {
    title: 'Apple iPad Air 11 (M2, 128 GB, Wi-Fi)',
    shortDescription: 'Lightweight iPad with M2 power for students and creative multitaskers.',
    description:
      'An all-rounder tablet with premium Apple performance, excellent app support, and a form factor that stays easy to carry.',
    brand: 'Apple',
    category: 'Tablets',
    subcategory: 'Student',
    tags: ['Tablet', 'iPadOS', 'Student'],
    price: 59900,
    compareAtPrice: 64900,
    images: [u('1544244015-0df4b3ffc6b0'), u('1516321318423-f06f85e504b3')],
    specifications: [
      { label: 'Display', value: '11" Liquid Retina' },
      { label: 'Chip', value: 'Apple M2' },
      { label: 'Storage', value: '128 GB' },
      { label: 'Weight', value: '462 g' },
    ],
    inventory: stock('BMOBILE-IPADAIR11-128', 18, 4),
    isFeatured: false,
  },
  {
    title: 'Samsung Galaxy Tab S10 Ultra (12 GB RAM, 256 GB)',
    shortDescription: 'Massive AMOLED display, DeX support, and stylus-ready productivity.',
    description:
      'A premium Android tablet built to replace lighter laptop tasks, ideal for note taking, media, and multi-window work.',
    brand: 'Samsung',
    category: 'Tablets',
    subcategory: 'Productivity',
    tags: ['Tablet', 'Android', 'AMOLED'],
    price: 112999,
    compareAtPrice: 119999,
    images: [u('1516321318423-f06f85e504b3'), u('1544244015-0df4b3ffc6b0')],
    specifications: [
      { label: 'Display', value: '14.6" Dynamic AMOLED 2X' },
      { label: 'Memory', value: '12 GB RAM' },
      { label: 'Storage', value: '256 GB' },
      { label: 'Battery', value: '11200 mAh' },
    ],
    inventory: stock('BMOBILE-TABS10U-256', 9, 2),
    isFeatured: true,
  },
  {
    title: 'Samsung Galaxy Tab S9 FE+ (8 GB RAM, 128 GB)',
    shortDescription: 'Large display, bundled stylus support, and balanced value for study and media.',
    description:
      'A more accessible Samsung tablet for learning, notes, entertainment, and light productivity without losing the Galaxy ecosystem.',
    brand: 'Samsung',
    category: 'Tablets',
    subcategory: 'Student',
    tags: ['Tablet', 'Android', 'Stylus'],
    price: 42999,
    compareAtPrice: 47999,
    images: [u('1516321318423-f06f85e504b3'), u('1517336714739-489689fd1ca8')],
    specifications: [
      { label: 'Display', value: '12.4" LCD 90 Hz' },
      { label: 'Memory', value: '8 GB RAM' },
      { label: 'Storage', value: '128 GB' },
      { label: 'Battery', value: '10090 mAh' },
    ],
    inventory: stock('BMOBILE-TABS9FEPLUS-128', 16, 4),
    isFeatured: false,
  },
  {
    title: 'OnePlus Pad 2 (12 GB RAM, 256 GB)',
    shortDescription: 'Fast, smooth Android tablet built for media, multitasking, and keyboard use.',
    description:
      'A polished Android tablet with strong performance, clean software, and accessories that make it easy to work and watch anywhere.',
    brand: 'OnePlus',
    category: 'Tablets',
    subcategory: 'Productivity',
    tags: ['Tablet', 'Android', 'Multitasking'],
    price: 39999,
    compareAtPrice: 44999,
    images: [u('1544244015-0df4b3ffc6b0'), u('1516321318423-f06f85e504b3')],
    specifications: [
      { label: 'Display', value: '12.1" 144 Hz LCD' },
      { label: 'Chip', value: 'Snapdragon 8 Gen 3' },
      { label: 'Storage', value: '256 GB' },
      { label: 'Battery', value: '9510 mAh' },
    ],
    inventory: stock('BMOBILE-OPPAD2-256', 20, 5),
    isFeatured: false,
  },
  {
    title: 'Lenovo Tab P12 (8 GB RAM, 128 GB)',
    shortDescription: 'Large-screen Android tablet for students, reading, and casual productivity.',
    description:
      'A value-focused tablet with a large display, strong battery life, and enough room for note-taking and streaming on the go.',
    brand: 'Lenovo',
    category: 'Tablets',
    subcategory: 'Student',
    tags: ['Tablet', 'Android', 'Value'],
    price: 28999,
    compareAtPrice: 32999,
    images: [u('1516321318423-f06f85e504b3'), u('1544244015-0df4b3ffc6b0')],
    specifications: [
      { label: 'Display', value: '12.7" 3K LCD' },
      { label: 'Memory', value: '8 GB RAM' },
      { label: 'Storage', value: '128 GB' },
      { label: 'Battery', value: '10200 mAh' },
    ],
    inventory: stock('BMOBILE-LENP12-128', 22, 5),
    isFeatured: false,
  },
  {
    title: 'Apple MacBook Air 15 (M3, 16 GB, 512 GB)',
    shortDescription: 'Thin-and-light premium laptop with strong battery life and silent performance.',
    description:
      'A polished laptop for professionals, students, and creators who want premium everyday speed with a clean design and long battery life.',
    brand: 'Apple',
    category: 'Laptops',
    subcategory: 'Productivity',
    tags: ['Laptop', 'macOS', 'Ultrabook'],
    price: 159900,
    compareAtPrice: 169900,
    images: [u('1517336714739-489689fd1ca8'), u('1496181133206-80ce9b88a853')],
    specifications: [
      { label: 'Display', value: '15.3" Liquid Retina' },
      { label: 'Chip', value: 'Apple M3' },
      { label: 'Memory', value: '16 GB unified memory' },
      { label: 'Storage', value: '512 GB SSD' },
    ],
    inventory: stock('BMOBILE-MBA15-M3-512', 8, 2),
    isFeatured: true,
  },
  {
    title: 'Apple MacBook Pro 14 (M4 Pro, 18 GB, 512 GB)',
    shortDescription: 'Creator-grade laptop with brighter display and stronger sustained performance.',
    description:
      'A premium work machine for developers, video editors, and professionals who need top-tier battery life and stronger thermals.',
    brand: 'Apple',
    category: 'Laptops',
    subcategory: 'Creator',
    tags: ['Laptop', 'macOS', 'Creator'],
    price: 209900,
    compareAtPrice: 219900,
    images: [u('1496181133206-80ce9b88a853'), u('1517336714739-489689fd1ca8')],
    specifications: [
      { label: 'Display', value: '14.2" Liquid Retina XDR' },
      { label: 'Chip', value: 'Apple M4 Pro' },
      { label: 'Memory', value: '18 GB unified memory' },
      { label: 'Storage', value: '512 GB SSD' },
    ],
    inventory: stock('BMOBILE-MBP14-M4PRO-512', 7, 2),
    isFeatured: true,
  },
  {
    title: 'Dell XPS 14 (Core Ultra 7, 16 GB, 1 TB)',
    shortDescription: 'Premium Windows ultrabook with creator-friendly display and clean industrial design.',
    description:
      'A high-end Windows machine built for buyers who want premium build quality, portability, and a more refined professional presence.',
    brand: 'Dell',
    category: 'Laptops',
    subcategory: 'Creator',
    tags: ['Laptop', 'Windows', 'Creator'],
    price: 189999,
    compareAtPrice: 199999,
    images: [u('1496181133206-80ce9b88a853'), u('1525547719571-a2d4ac8945e2')],
    specifications: [
      { label: 'Display', value: '14.5" 3.2K OLED' },
      { label: 'Processor', value: 'Intel Core Ultra 7' },
      { label: 'Memory', value: '16 GB RAM' },
      { label: 'Storage', value: '1 TB SSD' },
    ],
    inventory: stock('BMOBILE-XPS14-1TB', 10, 3),
    isFeatured: false,
  },
  {
    title: 'ASUS ROG Zephyrus G16 (RTX 4070, 16 GB, 1 TB)',
    shortDescription: 'Premium gaming laptop with creator-grade display and strong thermals.',
    description:
      'A sleek high-performance notebook for gamers and creators who want power without going full bulky desktop replacement.',
    brand: 'ASUS',
    category: 'Laptops',
    subcategory: 'Gaming',
    tags: ['Laptop', 'Gaming', 'RTX'],
    price: 214999,
    compareAtPrice: 224999,
    images: [u('1511512578047-dfb367046420'), u('1496181133206-80ce9b88a853')],
    specifications: [
      { label: 'Display', value: '16" OLED 240 Hz' },
      { label: 'Processor', value: 'Intel Core Ultra 9' },
      { label: 'Graphics', value: 'NVIDIA RTX 4070' },
      { label: 'Storage', value: '1 TB SSD' },
    ],
    inventory: stock('BMOBILE-ROGG16-4070', 9, 2),
    isFeatured: true,
  },
  {
    title: 'Lenovo Legion 7i (RTX 4060, 16 GB, 1 TB)',
    shortDescription: 'High-refresh gaming laptop tuned for long sessions and good cooling.',
    description:
      'A strong gaming-first laptop for buyers who care about frame rates, thermal headroom, and upgrade-friendly performance.',
    brand: 'Lenovo',
    category: 'Laptops',
    subcategory: 'Gaming',
    tags: ['Laptop', 'Gaming', 'RTX'],
    price: 174999,
    compareAtPrice: 184999,
    images: [u('1511512578047-dfb367046420'), u('1525547719571-a2d4ac8945e2')],
    specifications: [
      { label: 'Display', value: '16" QHD+ 240 Hz' },
      { label: 'Processor', value: 'Intel Core i9' },
      { label: 'Graphics', value: 'NVIDIA RTX 4060' },
      { label: 'Storage', value: '1 TB SSD' },
    ],
    inventory: stock('BMOBILE-LEGION7I-4060', 12, 3),
    isFeatured: false,
  },
  {
    title: 'HP Omen Transcend 14 (RTX 4060, 16 GB, 1 TB)',
    shortDescription: 'Portable OLED gaming laptop that also fits creator workflows.',
    description:
      'A compact high-performance machine that balances gaming power, OLED visuals, and easier day-to-day portability.',
    brand: 'HP',
    category: 'Laptops',
    subcategory: 'Gaming',
    tags: ['Laptop', 'Gaming', 'OLED'],
    price: 169999,
    compareAtPrice: 179999,
    images: [u('1511512578047-dfb367046420'), u('1496181133206-80ce9b88a853')],
    specifications: [
      { label: 'Display', value: '14" 2.8K OLED 120 Hz' },
      { label: 'Processor', value: 'Intel Core Ultra 7' },
      { label: 'Graphics', value: 'NVIDIA RTX 4060' },
      { label: 'Weight', value: '1.63 kg' },
    ],
    inventory: stock('BMOBILE-OMEN14-4060', 10, 3),
    isFeatured: false,
  },
  {
    title: 'Lenovo Yoga Book 9i (Core Ultra 7, 16 GB, 1 TB)',
    shortDescription: 'Dual-screen productivity laptop for multitaskers and hybrid workers.',
    description:
      'A distinctive productivity-first machine built for people who want more workspace without carrying a full desktop setup.',
    brand: 'Lenovo',
    category: 'Laptops',
    subcategory: 'Productivity',
    tags: ['Laptop', 'Windows', 'Dual screen'],
    price: 199999,
    compareAtPrice: 209999,
    images: [u('1525547719571-a2d4ac8945e2'), u('1496181133206-80ce9b88a853')],
    specifications: [
      { label: 'Display', value: 'Dual 13.3" OLED panels' },
      { label: 'Processor', value: 'Intel Core Ultra 7' },
      { label: 'Memory', value: '16 GB RAM' },
      { label: 'Storage', value: '1 TB SSD' },
    ],
    inventory: stock('BMOBILE-YOGA9I-DUAL', 6, 2),
    isFeatured: false,
  },
  {
    title: 'Acer Swift Go 14 (Core Ultra 5, 16 GB, 512 GB)',
    shortDescription: 'Lightweight productivity laptop with OLED display and strong value.',
    description:
      'A modern ultrabook for students and professionals who want portability, decent power, and a more accessible price.',
    brand: 'Acer',
    category: 'Laptops',
    subcategory: 'Productivity',
    tags: ['Laptop', 'Windows', 'Ultrabook'],
    price: 79999,
    compareAtPrice: 86999,
    images: [u('1496181133206-80ce9b88a853'), u('1525547719571-a2d4ac8945e2')],
    specifications: [
      { label: 'Display', value: '14" OLED' },
      { label: 'Processor', value: 'Intel Core Ultra 5' },
      { label: 'Memory', value: '16 GB RAM' },
      { label: 'Storage', value: '512 GB SSD' },
    ],
    inventory: stock('BMOBILE-SWIFTGO14-512', 15, 4),
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
        storeDescription: 'Demo inventory spanning phones, tablets, and laptops.',
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

  for (const item of catalogItems) {
    await Product.create({
      ...item,
      seller: seller._id,
      status: PRODUCT_STATUS.PUBLISHED,
      isActive: true,
      ratings: {
        average: Number((4.1 + Math.random() * 0.8).toFixed(1)),
        count: Math.floor(35 + Math.random() * 450),
      },
    });
  }

  console.log(`Seeded ${catalogItems.length} products across phones, tablets, and laptops.`);
  console.log(`Seller login: ${SELLER_EMAIL} / DemoSeller@123`);
  await mongoose.disconnect();
}

seed().catch((error) => {
  console.error(error);
  process.exit(1);
});
