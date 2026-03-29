import { Router } from 'express';
import {
  createProduct,
  deleteProduct,
  getFeaturedProducts,
  getProductByIdentifier,
  getProducts,
  getSellerProducts,
  updateProduct,
  upsertReview,
} from '../controllers/productController.js';
import { protect } from '../middleware/authMiddleware.js';
import authorize from '../middleware/roleMiddleware.js';
import { ROLES } from '../constants/roles.js';

const router = Router();

router.get('/admin/all', protect, authorize(ROLES.ADMIN), getProducts);
router.get('/', getProducts);
router.get('/featured', getFeaturedProducts);
router.get('/seller/my-products', protect, authorize(ROLES.ADMIN, ROLES.SHOPKEEPER), getSellerProducts);
router.post('/', protect, authorize(ROLES.ADMIN, ROLES.SHOPKEEPER), createProduct);
router.post('/:id/reviews', protect, authorize(ROLES.CUSTOMER), upsertReview);
router.get('/:identifier', getProductByIdentifier);
router.put('/:id', protect, authorize(ROLES.ADMIN, ROLES.SHOPKEEPER), updateProduct);
router.delete('/:id', protect, authorize(ROLES.ADMIN, ROLES.SHOPKEEPER), deleteProduct);

export default router;
