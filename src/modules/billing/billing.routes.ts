import { Router } from 'express';
import {
  generateMonthlyBill,
  issueBill,
  generateAllBills,
  markPaid,
  markUnpaid,
  sendReminder,
  updateBill,
  listBills,
  deleteBill,
  getBillDetails,
  downloadBillPdf,
} from './billing.controller';

const router = Router({ mergeParams: true });

router.get('/bill/:billId', getBillDetails);
router.get('/bill/:billId/pdf', downloadBillPdf);
router.get('/:sellerId', listBills);
router.get('/:sellerId/:customerId', generateMonthlyBill);
router.post('/:sellerId/generate-all', generateAllBills);
router.post('/:billId/issue', issueBill);
router.put('/:billId', updateBill);
router.post('/:billId/reminder', sendReminder);
router.post('/:billId/pay', markPaid);
router.post('/:billId/unpay', markUnpaid);
router.delete('/:billId', deleteBill);

export default router;
