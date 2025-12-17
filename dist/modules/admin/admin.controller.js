"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getGlobalReports = exports.changeSellerStatus = exports.listSellers = void 0;
const admin_service_1 = require("./admin.service");
const listSellers = async (_req, res, next) => {
    try {
        const sellers = await admin_service_1.adminService.listSellers();
        res.json(sellers);
    }
    catch (error) {
        next(error);
    }
};
exports.listSellers = listSellers;
const changeSellerStatus = async (req, res, next) => {
    try {
        const seller = await admin_service_1.adminService.changeSellerStatus(req.params.sellerId, req.body);
        res.json(seller);
    }
    catch (error) {
        next(error);
    }
};
exports.changeSellerStatus = changeSellerStatus;
const getGlobalReports = async (_req, res, next) => {
    try {
        const report = await admin_service_1.adminService.globalReports();
        res.json(report);
    }
    catch (error) {
        next(error);
    }
};
exports.getGlobalReports = getGlobalReports;
//# sourceMappingURL=admin.controller.js.map