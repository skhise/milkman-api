import { Router } from 'express';
import { listSubscriptionCollections, markSubscriptionCollectionPaid } from './payment.controller';

const router = Router();

router.get('/subscriptions', listSubscriptionCollections);
router.post('/subscriptions/:collectionId/mark-paid', markSubscriptionCollectionPaid);

export default router;
