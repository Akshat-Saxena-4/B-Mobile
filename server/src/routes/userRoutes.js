import { Router } from 'express';
import {
  clearCart,
  deleteUser,
  getCart,
  getUsers,
  getWishlist,
  removeCartItem,
  toggleUserStatus,
  toggleWishlist,
  updateSellerApproval,
  upsertCartItem,
} from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(protect);

router.get('/wishlist', authorize(ROLES.CUSTOMER), getWishlist);
router.post('/wishlist/:productId', authorize(ROLES.CUSTOMER), toggleWishlist);
router.get('/cart', authorize(ROLES.CUSTOMER), getCart);
router.post('/cart', authorize(ROLES.CUSTOMER), upsertCartItem);
router.delete('/cart/:productId', authorize(ROLES.CUSTOMER), removeCartItem);
router.delete('/cart', authorize(ROLES.CUSTOMER), clearCart);

router.get('/', authorize(ROLES.ADMIN), getUsers);
router.patch('/:userId/status', authorize(ROLES.ADMIN), toggleUserStatus);
router.patch('/:userId/seller-approval', authorize(ROLES.ADMIN), updateSellerApproval);
router.delete('/:userId', authorize(ROLES.ADMIN), deleteUser);

export default router;
