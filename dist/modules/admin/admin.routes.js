"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const admin_controller_1 = require("./admin.controller");
const router = (0, express_1.Router)();
router.get('/sellers', admin_controller_1.listSellers);
router.patch('/sellers/:sellerId/status', admin_controller_1.changeSellerStatus);
router.get('/reports', admin_controller_1.getGlobalReports);
exports.default = router;
//# sourceMappingURL=admin.routes.js.map