"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const seller_controller_1 = require("./seller.controller");
const router = (0, express_1.Router)();
router.get('/', seller_controller_1.listSellers);
router.post('/', seller_controller_1.createSeller);
router.put('/:sellerId', seller_controller_1.updateSeller);
router.get('/:sellerId/dashboard', seller_controller_1.getDashboard);
router.get('/:sellerId/customers', seller_controller_1.listCustomers);
router.put('/:sellerId/profile', seller_controller_1.updateProfile);
router.post('/:sellerId/subscription', seller_controller_1.updateSellerSubscription);
router.get('/:sellerId/analytics', seller_controller_1.getAnalytics);
exports.default = router;
//# sourceMappingURL=seller.routes.js.map