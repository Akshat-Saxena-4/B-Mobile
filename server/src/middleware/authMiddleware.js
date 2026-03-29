import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import env from '../config/env.js';
import asyncHandler from '../utils/asyncHandler.js';

export const protect = asyncHandler(async (req, res, next) => {
  const authHeader = req.headers.authorization || '';

  if (!authHeader.startsWith('Bearer ')) {
    res.status(401);
    throw new Error('Authentication token missing');
  }

  const token = authHeader.split(' ')[1];
  const decoded = jwt.verify(token, env.jwtSecret);
  const user = await User.findById(decoded.id).select('-password');

  if (!user) {
    res.status(401);
    throw new Error('User no longer exists');
  }

  if (!user.isActive) {
    res.status(403);
    throw new Error('User account is deactivated');
  }

  req.user = user;
  next();
});

