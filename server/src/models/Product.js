import mongoose from 'mongoose';
import { PRODUCT_STATUS } from '../constants/roles.js';
import slugify from '../utils/slugify.js';

const specificationSchema = new mongoose.Schema(
  {
    label: { type: String, required: true, trim: true },
    value: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const inventorySchema = new mongoose.Schema(
  {
    sku: { type: String, required: true, trim: true },
    stock: { type: Number, required: true, min: 0, default: 0 },
    lowStockThreshold: { type: Number, min: 0, default: 10 },
  },
  { _id: false }
);

const productSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    shortDescription: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    brand: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    subcategory: { type: String, trim: true, default: '' },
    tags: [{ type: String, trim: true }],
    price: { type: Number, required: true, min: 0 },
    compareAtPrice: { type: Number, min: 0, default: 0 },
    costPrice: { type: Number, min: 0, default: 0 },
    images: [{ type: String, required: true }],
    thumbnail: { type: String, default: '' },
    specifications: [specificationSchema],
    inventory: { type: inventorySchema, required: true },
    seller: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: {
      type: String,
      enum: Object.values(PRODUCT_STATUS),
      default: PRODUCT_STATUS.PUBLISHED,
    },
    isFeatured: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    ratings: {
      average: { type: Number, default: 0 },
      count: { type: Number, default: 0 },
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
  }
);

productSchema.pre('validate', function createSlug(next) {
  if (this.title) {
    this.slug = slugify(this.title);
  }

  if (!this.thumbnail && this.images?.length) {
    this.thumbnail = this.images[0];
  }

  next();
});

productSchema.virtual('discountPercentage').get(function discountPercentage() {
  if (!this.compareAtPrice || this.compareAtPrice <= this.price) {
    return 0;
  }

  return Math.round(((this.compareAtPrice - this.price) / this.compareAtPrice) * 100);
});

const Product = mongoose.model('Product', productSchema);

export default Product;

