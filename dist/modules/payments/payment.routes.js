"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const payment_controller_1 = require("./payment.controller");
const router = (0, express_1.Router)();
router.get('/subscriptions', payment_controller_1.listSubscriptionCollections);
router.post('/subscriptions/:collectionId/mark-paid', payment_controller_1.markSubscriptionCollectionPaid);
exports.default = router;
//# sourceMappingURL=payment.routes.js.map