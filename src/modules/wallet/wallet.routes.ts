import { Router } from 'express';
import { addFunds, deductFunds, getWallet } from './wallet.controller';

const router = Router({ mergeParams: true });

router.get('/:customerId', getWallet);
router.post('/:customerId/add', addFunds);
router.post('/:customerId/deduct', deductFunds);

export default router;
