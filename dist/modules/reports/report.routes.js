"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const report_controller_1 = require("./report.controller");
const router = (0, express_1.Router)({ mergeParams: true });
router.get('/:sellerId/customers', report_controller_1.getCustomerConsumption);
router.get('/:sellerId/products', report_controller_1.getProductSales);
router.get('/:sellerId/revenue', report_controller_1.getRevenueReport);
router.get('/download/:type', report_controller_1.downloadReport);
exports.default = router;
//# sourceMappingURL=report.routes.js.map