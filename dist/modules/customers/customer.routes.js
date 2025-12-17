"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const customer_controller_1 = require("./customer.controller");
const router = (0, express_1.Router)({ mergeParams: true });
router.get('/user/:userId', customer_controller_1.getCustomerByUserId);
router.post('/:sellerId', customer_controller_1.createCustomer);
router.get('/:sellerId', customer_controller_1.listCustomers);
router.patch('/:customerId/status', customer_controller_1.toggleCustomer);
router.put('/:customerId', customer_controller_1.updateCustomer);
router.patch('/:customerId/pause', customer_controller_1.setPauseWindow);
router.get('/:customerId/pause/history', customer_controller_1.getPauseHistory);
router.post('/:customerId/pause/:pauseId/cancel', customer_controller_1.cancelPause);
router.post('/:customerId/reset-pin', customer_controller_1.resetCustomerPin);
router.post('/:customerId/exit', customer_controller_1.exitCustomer);
exports.default = router;
//# sourceMappingURL=customer.routes.js.map