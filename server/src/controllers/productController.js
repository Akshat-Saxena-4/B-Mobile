import mongoose from 'mongoose';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import Order from '../models/Order.js';
import asyncHandler from '../utils/asyncHandler.js';
import { ORDER_STATUS, PRODUCT_STATUS, ROLES, SELLER_STATUS } from '../constants/roles.js';

const parseArrayInput = (value) => {
  if (Array.isArray(value)) {
    return value.filter(Boolean);
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed.filter(Boolean) : [];
    } catch (error) {
      return value
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean);
    }
  }

  return [];
};

const parseSpecifications = (value) => {
  if (Array.isArray(value)) {
    return value;
  }

  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : [];
    } catch (error) {
      return [];
    }
  }

  return [];
};

const normalizeProductPayload = (body) => ({
  title: body.title,
  shortDescription: body.shortDescription,
  description: body.description,
  brand: body.brand,
  category: body.category,
  subcategory: body.subcategory || '',
  tags: parseArrayInput(body.tags),
  price: Number(body.price),
  compareAtPrice: Number(body.compareAtPrice || 0),
  costPrice: Number(body.costPrice || 0),
  images: parseArrayInput(body.images),
  specifications: parseSpecifications(body.specifications),
  inventory: {
    sku: body.inventory?.sku || body.sku,
    stock: Number(body.inventory?.stock ?? body.stock ?? 0),
    lowStockThreshold: Number(
      body.inventory?.lowStockThreshold ?? body.lowStockThreshold ?? 10
    ),
  },
  isFeatured: body.isFeatured === true || body.isFeatured === 'true',
  status: body.status || PRODUCT_STATUS.PUBLISHED,
});

const populateProduct = (query) =>
  query.populate('seller', 'firstName lastName sellerProfile.shopName sellerProfile.status');

export const getProducts = asyncHandler(async (req, res) => {
  const page = Number(req.query.page || 1);
  const limit = Math.min(Number(req.query.limit || 12), 50);
  const skip = (page - 1) * limit;
  const query = {};

  if (!req.user || req.user.role === ROLES.CUSTOMER) {
    query.isActive = true;
    query.status = PRODUCT_STATUS.PUBLISHED;
  }

  if (req.query.search) {
    query.$or = [
      { title: { $regex: req.query.search, $options: 'i' } },
      { description: { $regex: req.query.search, $options: 'i' } },
      { brand: { $regex: req.query.search, $options: 'i' } },
      { category: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  if (req.query.category) query.category = req.query.category;
  if (req.query.subcategory) query.subcategory = req.query.subcategory;
  if (req.query.brand) query.brand = req.query.brand;
  if (req.query.seller) query.seller = req.query.seller;
  if (req.query.status && req.user?.role === ROLES.ADMIN) query.status = req.query.status;
  if (req.query.featured === 'true') query.isFeatured = true;
  if (req.query.minPrice || req.query.maxPrice) {
    query.price = {};
    if (req.query.minPrice) query.price.$gte = Number(req.query.minPrice);
    if (req.query.maxPrice) query.price.$lte = Number(req.query.maxPrice);
  }

  const sortOptions = {
    newest: { createdAt: -1 },
    priceAsc: { price: 1 },
    priceDesc: { price: -1 },
    rating: { 'ratings.average': -1 },
    featured: { isFeatured: -1, createdAt: -1 },
  };

  const total = await Product.countDocuments(query);
  const products = await populateProduct(
    Product.find(query)
      .sort(sortOptions[req.query.sort] || sortOptions.featured)
      .skip(skip)
      .limit(limit)
  );

  res.json({
    success: true,
    data: products,
    meta: {
      page,
      limit,
      total,
      totalPages: Math.max(1, Math.ceil(total / limit)),
    },
  });
});

export const getFeaturedProducts = asyncHandler(async (req, res) => {
  const products = await populateProduct(
    Product.find({
      isFeatured: true,
      isActive: true,
      status: PRODUCT_STATUS.PUBLISHED,
    })
      .sort({ createdAt: -1 })
      .limit(8)
  );

  res.json({
    success: true,
    data: products,
  });
});

export const getProductByIdentifier = asyncHandler(async (req, res) => {
  const { identifier } = req.params;
  const query = mongoose.Types.ObjectId.isValid(identifier)
    ? { _id: identifier }
    : { slug: identifier };

  const product = await populateProduct(Product.findOne(query));

  if (!product || !product.isActive || product.status !== PRODUCT_STATUS.PUBLISHED) {
    res.status(404);
    throw new Error('Product not found');
  }

  const reviews = await Review.find({ product: product._id })
    .populate('user', 'firstName lastName')
    .sort({ createdAt: -1 });

  res.json({
    success: true,
    data: {
      ...product.toObject(),
      reviews,
    },
  });
});

export const getSellerProducts = asyncHandler(async (req, res) => {
  const query =
    req.user.role === ROLES.ADMIN && req.query.sellerId
      ? { seller: req.query.sellerId }
      : { seller: req.user._id };

  const products = await Product.find(query).sort({ createdAt: -1 });

  res.json({
    success: true,
    data: products,
  });
});

export const createProduct = asyncHandler(async (req, res) => {
  if (
    req.user.role === ROLES.SHOPKEEPER &&
    req.user.sellerProfile.status !== SELLER_STATUS.APPROVED
  ) {
    res.status(403);
    throw new Error('Seller account must be approved before products can be listed');
  }

  const payload = normalizeProductPayload(req.body);

  if (
    !payload.title ||
    !payload.shortDescription ||
    !payload.description ||
    !payload.brand ||
    !payload.category ||
    !payload.images.length ||
    !payload.inventory.sku
  ) {
    res.status(400);
    throw new Error('Missing required product fields');
  }

  const product = await Product.create({
    ...payload,
    seller: req.user._id,
  });

  res.status(201).json({
    success: true,
    message: 'Product created successfully',
    data: product,
  });
});

export const updateProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const isOwner = product.seller.toString() === req.user._id.toString();
  if (req.user.role !== ROLES.ADMIN && !isOwner) {
    res.status(403);
    throw new Error('You do not have permission to update this product');
  }

  const payload = normalizeProductPayload(req.body);
  Object.assign(product, {
    ...payload,
    inventory: {
      ...product.inventory.toObject(),
      ...payload.inventory,
    },
  });
  await product.save();

  res.json({
    success: true,
    message: 'Product updated successfully',
    data: product,
  });
});

export const deleteProduct = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const isOwner = product.seller.toString() === req.user._id.toString();
  if (req.user.role !== ROLES.ADMIN && !isOwner) {
    res.status(403);
    throw new Error('You do not have permission to delete this product');
  }

  product.isActive = false;
  product.status = PRODUCT_STATUS.ARCHIVED;
  await product.save();

  res.json({
    success: true,
    message: 'Product archived successfully',
  });
});

export const upsertReview = asyncHandler(async (req, res) => {
  const { rating, title, comment } = req.body;

  if (!rating || Number(rating) < 1 || Number(rating) > 5) {
    res.status(400);
    throw new Error('Rating must be between 1 and 5');
  }

  const product = await Product.findById(req.params.id);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const hasPurchased = await Order.exists({
    customer: req.user._id,
    'items.product': product._id,
    'fulfillment.status': ORDER_STATUS.DELIVERED,
  });

  const review = await Review.findOneAndUpdate(
    {
      user: req.user._id,
      product: product._id,
    },
    {
      rating: Number(rating),
      title: title || '',
      comment: comment || '',
      isVerifiedPurchase: Boolean(hasPurchased),
    },
    {
      upsert: true,
      new: true,
      setDefaultsOnInsert: true,
    }
  );

  const reviews = await Review.find({ product: product._id });
  const totalRating = reviews.reduce((sum, item) => sum + item.rating, 0);

  product.ratings.average = reviews.length ? Number((totalRating / reviews.length).toFixed(1)) : 0;
  product.ratings.count = reviews.length;
  await product.save();

  res.json({
    success: true,
    message: 'Review submitted successfully',
    data: review,
  });
});

