import { Router } from 'express';
import {
  createCustomer,
  exitCustomer,
  getCustomerByUserId,
  listCustomers,
  resetCustomerPin,
  setPauseWindow,
  toggleCustomer,
  updateCustomer,
  getPauseHistory,
  cancelPause,
} from './customer.controller';

const router = Router({ mergeParams: true });

router.get('/user/:userId', getCustomerByUserId);
router.post('/:sellerId', createCustomer);
router.get('/:sellerId', listCustomers);
router.patch('/:customerId/status', toggleCustomer);
router.put('/:customerId', updateCustomer);
router.patch('/:customerId/pause', setPauseWindow);
router.get('/:customerId/pause/history', getPauseHistory);
router.post('/:customerId/pause/:pauseId/cancel', cancelPause);
router.post('/:customerId/reset-pin', resetCustomerPin);
router.post('/:customerId/exit', exitCustomer);

export default router;
