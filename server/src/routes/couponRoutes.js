import { Router } from 'express';
import {
  createCoupon,
  deleteCoupon,
  getCoupons,
  updateCoupon,
  validateCoupon,
} from '../controllers/couponController.js';
import { protect } from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.post('/validate', validateCoupon);
router.get('/', protect, authorize(ROLES.ADMIN), getCoupons);
router.post('/', protect, authorize(ROLES.ADMIN), createCoupon);
router.put('/:id', protect, authorize(ROLES.ADMIN), updateCoupon);
router.delete('/:id', protect, authorize(ROLES.ADMIN), deleteCoupon);

export default router;
