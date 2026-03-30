import User from '../models/User.js';
import Product from '../models/Product.js';
import Review from '../models/Review.js';
import asyncHandler from '../utils/asyncHandler.js';
import { PRODUCT_STATUS, ROLES, SELLER_STATUS } from '../constants/roles.js';

const populateCart = async (userId) =>
  User.findById(userId)
    .select('cart')
    .populate('cart.product', 'title slug price thumbnail brand inventory ratings');

const archiveSellerProducts = async (sellerId) => {
  const sellerProducts = await Product.find({ seller: sellerId }).select('_id');
  const productIds = sellerProducts.map((product) => product._id);

  if (!productIds.length) {
    return 0;
  }

  await Product.updateMany(
    { _id: { $in: productIds } },
    {
      $set: {
        isActive: false,
        status: PRODUCT_STATUS.ARCHIVED,
      },
    }
  );

  await User.updateMany(
    {},
    {
      $pull: {
        wishlist: { $in: productIds },
        cart: { product: { $in: productIds } },
      },
    }
  );

  return productIds.length;
};

export const getUsers = asyncHandler(async (req, res) => {
  const query = {};

  if (req.query.role) query.role = req.query.role;
  if (req.query.isActive) query.isActive = req.query.isActive === 'true';
  if (req.query.sellerStatus) query['sellerProfile.status'] = req.query.sellerStatus;
  if (req.query.search) {
    query.$or = [
      { firstName: { $regex: req.query.search, $options: 'i' } },
      { lastName: { $regex: req.query.search, $options: 'i' } },
      { email: { $regex: req.query.search, $options: 'i' } },
    ];
  }

  const users = await User.find(query).select('-password').sort({ createdAt: -1 });

  res.json({
    success: true,
    data: users,
  });
});

export const toggleUserStatus = asyncHandler(async (req, res) => {
  const { isActive } = req.body;
  const user = await User.findById(req.params.userId).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  user.isActive = Boolean(isActive);
  await user.save();

  res.json({
    success: true,
    message: 'User status updated successfully',
    data: user,
  });
});

export const updateSellerApproval = asyncHandler(async (req, res) => {
  const { status, rejectionReason } = req.body;
  const user = await User.findById(req.params.userId).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('Seller not found');
  }

  if (![SELLER_STATUS.APPROVED, SELLER_STATUS.REJECTED].includes(status)) {
    res.status(400);
    throw new Error('Invalid seller approval state');
  }

  user.sellerProfile.status = status;
  user.sellerProfile.rejectionReason =
    status === SELLER_STATUS.REJECTED ? rejectionReason || 'Rejected by admin' : '';
  user.sellerProfile.approvedAt = status === SELLER_STATUS.APPROVED ? new Date() : undefined;
  await user.save();

  res.json({
    success: true,
    message: `Seller ${status.toLowerCase()} successfully`,
    data: user,
  });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.userId).select('-password');

  if (!user) {
    res.status(404);
    throw new Error('User not found');
  }

  if (user.role === ROLES.ADMIN) {
    res.status(400);
    throw new Error('Admin accounts cannot be deleted');
  }

  let archivedProducts = 0;
  if (user.role === ROLES.SHOPKEEPER) {
    archivedProducts = await archiveSellerProducts(user._id);
  }

  await Review.deleteMany({ user: user._id });
  await user.deleteOne();

  res.json({
    success: true,
    message: `${user.role === ROLES.SHOPKEEPER ? 'Shopkeeper' : 'User'} deleted successfully`,
    data: {
      _id: user._id,
      archivedProducts,
    },
  });
});

export const getWishlist = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).populate(
    'wishlist',
    'title slug price compareAtPrice thumbnail brand ratings isFeatured'
  );

  res.json({
    success: true,
    data: user.wishlist,
  });
});

export const toggleWishlist = asyncHandler(async (req, res) => {
  const product = await Product.findById(req.params.productId);

  if (!product) {
    res.status(404);
    throw new Error('Product not found');
  }

  const user = await User.findById(req.user._id);
  const existingIndex = user.wishlist.findIndex(
    (item) => item.toString() === req.params.productId.toString()
  );

  if (existingIndex >= 0) {
    user.wishlist.splice(existingIndex, 1);
  } else {
    user.wishlist.push(req.params.productId);
  }

  await user.save();
  const populated = await User.findById(req.user._id).populate(
    'wishlist',
    'title slug price compareAtPrice thumbnail brand ratings isFeatured'
  );

  res.json({
    success: true,
    message: existingIndex >= 0 ? 'Removed from wishlist' : 'Added to wishlist',
    data: populated.wishlist,
  });
});

export const getCart = asyncHandler(async (req, res) => {
  const user = await populateCart(req.user._id);

  res.json({
    success: true,
    data: user.cart,
  });
});

export const upsertCartItem = asyncHandler(async (req, res) => {
  const { productId, quantity = 1 } = req.body;
  const product = await Product.findById(productId);

  if (!product || !product.isActive) {
    res.status(404);
    throw new Error('Product not found');
  }

  const qty = Number(quantity);

  if (!qty || qty < 1) {
    res.status(400);
    throw new Error('Quantity must be at least 1');
  }

  if (product.inventory.stock < qty) {
    res.status(400);
    throw new Error('Requested quantity is not available');
  }

  const user = await User.findById(req.user._id);
  const existingItem = user.cart.find(
    (item) => item.product.toString() === productId.toString()
  );

  if (existingItem) {
    existingItem.quantity = qty;
  } else {
    user.cart.push({ product: productId, quantity: qty });
  }

  await user.save();
  const populated = await populateCart(req.user._id);

  res.json({
    success: true,
    message: 'Cart updated successfully',
    data: populated.cart,
  });
});

export const removeCartItem = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.cart = user.cart.filter(
    (item) => item.product.toString() !== req.params.productId.toString()
  );
  await user.save();

  const populated = await populateCart(req.user._id);

  res.json({
    success: true,
    message: 'Item removed from cart',
    data: populated.cart,
  });
});

export const clearCart = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  user.cart = [];
  await user.save();

  res.json({
    success: true,
    message: 'Cart cleared successfully',
    data: [],
  });
});
