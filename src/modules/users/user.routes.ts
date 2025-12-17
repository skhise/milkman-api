import { Router } from 'express';
import { getUserDashboard, getConsumption, markBillPaid } from './user.controller';

const router = Router({ mergeParams: true });

router.get('/:userId/dashboard', getUserDashboard);
router.get('/:userId/consumption', getConsumption);
router.post('/bills/:billId/pay', markBillPaid);

export default router;
