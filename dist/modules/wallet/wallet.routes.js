"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const wallet_controller_1 = require("./wallet.controller");
const router = (0, express_1.Router)({ mergeParams: true });
router.get('/:customerId', wallet_controller_1.getWallet);
router.post('/:customerId/add', wallet_controller_1.addFunds);
router.post('/:customerId/deduct', wallet_controller_1.deductFunds);
exports.default = router;
//# sourceMappingURL=wallet.routes.js.map