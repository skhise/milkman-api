import { Router } from 'express';
import { changeSellerStatus, getGlobalReports, listSellers } from './admin.controller';

const router = Router();

router.get('/sellers', listSellers);
router.patch('/sellers/:sellerId/status', changeSellerStatus);
router.get('/reports', getGlobalReports);

export default router;
