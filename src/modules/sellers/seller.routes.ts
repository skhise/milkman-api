import { Router } from 'express';
import {
  getDashboard,
  listCustomers,
  updateProfile,
  getAnalytics,
  createSeller,
  listSellers,
  updateSellerSubscription,
  updateSeller,
} from './seller.controller';

const router = Router();

router.get('/', listSellers);
router.post('/', createSeller);
router.put('/:sellerId', updateSeller);
router.get('/:sellerId/dashboard', getDashboard);
router.get('/:sellerId/customers', listCustomers);
router.put('/:sellerId/profile', updateProfile);
router.post('/:sellerId/subscription', updateSellerSubscription);
router.get('/:sellerId/analytics', getAnalytics);

export default router;
