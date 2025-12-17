import { Router } from 'express';
import { downloadReport, getCustomerConsumption, getProductSales, getRevenueReport } from './report.controller';

const router = Router({ mergeParams: true });

router.get('/:sellerId/customers', getCustomerConsumption);
router.get('/:sellerId/products', getProductSales);
router.get('/:sellerId/revenue', getRevenueReport);
router.get('/download/:type', downloadReport);

export default router;
