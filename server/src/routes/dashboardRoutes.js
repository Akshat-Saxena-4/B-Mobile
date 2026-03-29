import { Router } from 'express';
import {
  getAdminDashboard,
  getShopkeeperDashboard,
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.use(protect);

router.get('/shopkeeper', authorize(ROLES.SHOPKEEPER, ROLES.ADMIN), getShopkeeperDashboard);
router.get('/admin', authorize(ROLES.ADMIN), getAdminDashboard);

export default router;
