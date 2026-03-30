import User from '../models/User.js';
import generateToken from '../utils/generateToken.js';
import asyncHandler from '../utils/asyncHandler.js';
import env from '../config/env.js';
import { ROLES, SELLER_STATUS } from '../constants/roles.js';

const buildAuthPayload = (user) => ({
  user,
  token: generateToken({
    id: user._id,
    role: user.role,
  }),
});

export const register = asyncHandler(async (req, res) => {
  const {
    firstName,
    lastName,
    email,
    phone,
    password,
    role = ROLES.CUSTOMER,
    adminSecret,
    shopName,
    gstNumber,
    storeDescription,
  } = req.body;

  if (!firstName || !lastName || !email || !password) {
    res.status(400);
    throw new Error('First name, last name, email, and password are required');
  }

  if (!Object.values(ROLES).includes(role)) {
    res.status(400);
    throw new Error('Invalid role selected');
  }

  if (role === ROLES.ADMIN && adminSecret !== env.adminRegisterSecret) {
    res.status(403);
    throw new Error('Admin registration is not allowed without a valid invite code');
  }

  if (role === ROLES.SHOPKEEPER && !shopName) {
    res.status(400);
    throw new Error('Shopkeepers must provide a shop name');
  }

  const existingUser = await User.findOne({ email: email.toLowerCase() });

  if (existingUser) {
    res.status(409);
    throw new Error('An account with that email already exists');
  }

  const user = await User.create({
    firstName,
    lastName,
    email,
    phone,
    password,
    role,
    sellerProfile:
      role === ROLES.SHOPKEEPER
        ? {
            shopName,
            gstNumber,
            storeDescription,
            status: SELLER_STATUS.PENDING,
          }
        : undefined,
  });

  const safeUser = await User.findById(user._id).select('-password');

  res.status(201).json({
    success: true,
    message: 'Account created successfully',
    data: buildAuthPayload(safeUser),
  });
});

export const login = asyncHandler(async (req, res) => {
  const { email, password, expectedRole } = req.body;

  if (!email || !password) {
    res.status(400);
    throw new Error('Email and password are required');
  }

  if (expectedRole && !Object.values(ROLES).includes(expectedRole)) {
    res.status(400);
    throw new Error('Invalid login portal selected');
  }

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');

  if (!user || !(await user.comparePassword(password))) {
    res.status(401);
    throw new Error('Invalid email or password');
  }

  if (expectedRole && user.role !== expectedRole) {
    res.status(403);
    throw new Error(
      expectedRole === ROLES.ADMIN
        ? 'This account does not have access to the admin panel'
        : 'This account does not have access to this portal'
    );
  }

  const safeUser = await User.findById(user._id).select('-password');

  res.json({
    success: true,
    message: 'Login successful',
    data: buildAuthPayload(safeUser),
  });
});

export const getProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id)
    .select('-password')
    .populate('wishlist', 'title slug price thumbnail brand ratings')
    .populate('cart.product', 'title slug price thumbnail brand inventory ratings');

  res.json({
    success: true,
    data: user,
  });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select('-password');
  const { firstName, lastName, phone, avatar, addresses, sellerProfile } = req.body;

  if (firstName !== undefined) user.firstName = firstName;
  if (lastName !== undefined) user.lastName = lastName;
  if (phone !== undefined) user.phone = phone;
  if (avatar !== undefined) user.avatar = avatar;
  if (Array.isArray(addresses)) user.addresses = addresses;

  if (req.user.role === ROLES.SHOPKEEPER && sellerProfile) {
    user.sellerProfile = {
      ...user.sellerProfile,
      shopName: sellerProfile.shopName ?? user.sellerProfile.shopName,
      gstNumber: sellerProfile.gstNumber ?? user.sellerProfile.gstNumber,
      storeDescription:
        sellerProfile.storeDescription ?? user.sellerProfile.storeDescription,
    };
  }

  await user.save();

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: user,
  });
});
