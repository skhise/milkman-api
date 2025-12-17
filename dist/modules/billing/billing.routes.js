"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const billing_controller_1 = require("./billing.controller");
const router = (0, express_1.Router)({ mergeParams: true });
router.get('/bill/:billId', billing_controller_1.getBillDetails);
router.get('/bill/:billId/pdf', billing_controller_1.downloadBillPdf);
router.get('/:sellerId', billing_controller_1.listBills);
router.get('/:sellerId/:customerId', billing_controller_1.generateMonthlyBill);
router.post('/:sellerId/generate-all', billing_controller_1.generateAllBills);
router.post('/:billId/issue', billing_controller_1.issueBill);
router.put('/:billId', billing_controller_1.updateBill);
router.post('/:billId/reminder', billing_controller_1.sendReminder);
router.post('/:billId/pay', billing_controller_1.markPaid);
router.post('/:billId/unpay', billing_controller_1.markUnpaid);
router.delete('/:billId', billing_controller_1.deleteBill);
exports.default = router;
//# sourceMappingURL=billing.routes.js.map