# Database Schema

## User

```js
{
  firstName: String,
  lastName: String,
  email: String,
  phone: String,
  password: String,
  role: 'CUSTOMER' | 'SHOPKEEPER' | 'ADMIN',
  isActive: Boolean,
  addresses: [{
    label: String,
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    isDefault: Boolean
  }],
  wishlist: [ObjectId<Product>],
  cart: [{
    product: ObjectId<Product>,
    quantity: Number
  }],
  sellerProfile: {
    shopName: String,
    gstNumber: String,
    storeDescription: String,
    status: 'PENDING' | 'APPROVED' | 'REJECTED',
    approvedAt: Date,
    rejectionReason: String
  },
  stats: {
    totalOrders: Number,
    totalSpent: Number
  }
}
```

## Product

```js
{
  title: String,
  slug: String,
  shortDescription: String,
  description: String,
  brand: String,
  category: String,
  subcategory: String,
  tags: [String],
  price: Number,
  compareAtPrice: Number,
  costPrice: Number,
  images: [String],
  thumbnail: String,
  specifications: [{
    label: String,
    value: String
  }],
  inventory: {
    sku: String,
    stock: Number,
    lowStockThreshold: Number
  },
  seller: ObjectId<User>,
  status: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED',
  isFeatured: Boolean,
  isActive: Boolean,
  ratings: {
    average: Number,
    count: Number
  }
}
```

## Review

```js
{
  user: ObjectId<User>,
  product: ObjectId<Product>,
  rating: Number,
  title: String,
  comment: String,
  isVerifiedPurchase: Boolean
}
```

## Order

```js
{
  orderNumber: String,
  customer: ObjectId<User>,
  items: [{
    product: ObjectId<Product>,
    seller: ObjectId<User>,
    title: String,
    image: String,
    sku: String,
    quantity: Number,
    unitPrice: Number,
    lineTotal: Number
  }],
  pricing: {
    itemsTotal: Number,
    shippingFee: Number,
    taxAmount: Number,
    discountAmount: Number,
    grandTotal: Number
  },
  payment: {
    method: 'COD' | 'CARD' | 'UPI' | 'WALLET',
    status: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED',
    transactionId: String
  },
  coupon: {
    code: String,
    discountType: String,
    discountValue: Number
  },
  shippingAddress: {
    fullName: String,
    phone: String,
    line1: String,
    line2: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  fulfillment: {
    status: 'PLACED' | 'CONFIRMED' | 'PACKED' | 'SHIPPED' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED',
    trackingId: String,
    carrier: String,
    estimatedDelivery: Date,
    deliveredAt: Date
  },
  statusHistory: [{
    status: String,
    note: String,
    updatedBy: ObjectId<User>,
    updatedAt: Date
  }]
}
```

## Coupon

```js
{
  code: String,
  description: String,
  discountType: 'PERCENTAGE' | 'FIXED',
  amount: Number,
  minOrderValue: Number,
  maxDiscount: Number,
  usageLimit: Number,
  usedCount: Number,
  startsAt: Date,
  expiresAt: Date,
  isActive: Boolean
}
```

