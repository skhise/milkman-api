import { Router } from 'express';
import {
  listEntries,
  createEntry,
  markDelivery,
  updateEntry,
  deleteEntry,
  generateDailyEntries,
} from './dailyEntry.controller.js';

const router = Router({ mergeParams: true });

router.get('/:sellerId', listEntries);
router.post('/:sellerId', createEntry);
router.post('/:sellerId/generate', generateDailyEntries);
router.put('/:entryId', updateEntry);
router.delete('/:entryId', deleteEntry);
router.post('/:entryId/delivery', markDelivery);

export default router;
