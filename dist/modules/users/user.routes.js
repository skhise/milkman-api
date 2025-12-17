"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const user_controller_1 = require("./user.controller");
const router = (0, express_1.Router)({ mergeParams: true });
router.get('/:userId/dashboard', user_controller_1.getUserDashboard);
router.get('/:userId/consumption', user_controller_1.getConsumption);
router.post('/bills/:billId/pay', user_controller_1.markBillPaid);
exports.default = router;
//# sourceMappingURL=user.routes.js.map