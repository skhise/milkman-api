import { Router } from 'express';
import { assignPlan, createPlan, deletePlan, listPlans, updatePlan } from './subscription.controller';

const router = Router({ mergeParams: true });

router.get('/plans', listPlans);
router.post('/plans', createPlan);
router.put('/plans/:planId', updatePlan);
router.delete('/plans/:planId', deletePlan);
router.post('/:sellerId/assign', assignPlan);

export default router;
