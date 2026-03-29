import { Router } from 'express';
import {
  cancelOrder,
  createOrder,
  getAllOrders,
  getMyOrders,
  getOrderById,
  getOrderTracking,
  getSellerOrders,
  updateOrderStatus,
} from '../controllers/orderController.js';
import { protect } from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(protect);

router.post('/', authorize(ROLES.CUSTOMER), createOrder);
router.get('/mine', authorize(ROLES.CUSTOMER), getMyOrders);
router.get('/seller', authorize(ROLES.SHOPKEEPER, ROLES.ADMIN), getSellerOrders);
router.get('/admin/all', authorize(ROLES.ADMIN), getAllOrders);
router.get('/:id/track', getOrderTracking);
router.patch('/:id/status', authorize(ROLES.SHOPKEEPER, ROLES.ADMIN), updateOrderStatus);
router.patch('/:id/cancel', authorize(ROLES.CUSTOMER), cancelOrder);
router.get('/:id', getOrderById);

export default router;
