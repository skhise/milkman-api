"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const subscription_controller_1 = require("./subscription.controller");
const router = (0, express_1.Router)({ mergeParams: true });
router.get('/plans', subscription_controller_1.listPlans);
router.post('/plans', subscription_controller_1.createPlan);
router.put('/plans/:planId', subscription_controller_1.updatePlan);
router.delete('/plans/:planId', subscription_controller_1.deletePlan);
router.post('/:sellerId/assign', subscription_controller_1.assignPlan);
exports.default = router;
//# sourceMappingURL=subscription.routes.js.map