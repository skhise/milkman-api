"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getConsumption = exports.markBillPaid = exports.getUserDashboard = void 0;
const user_service_1 = require("./user.service");
const getUserDashboard = async (req, res, next) => {
    try {
        const dashboard = await user_service_1.userService.dashboard(req.params.userId);
        res.json(dashboard);
    }
    catch (error) {
        next(error);
    }
};
exports.getUserDashboard = getUserDashboard;
const markBillPaid = async (req, res, next) => {
    try {
        const payment = await user_service_1.userService.markBillPaid(req.params.billId, req.body);
        res.json(payment);
    }
    catch (error) {
        next(error);
    }
};
exports.markBillPaid = markBillPaid;
const getConsumption = async (req, res, next) => {
    try {
        const report = await user_service_1.userService.consumption(req.params.userId, req.query);
        res.json(report);
    }
    catch (error) {
        next(error);
    }
};
exports.getConsumption = getConsumption;
//# sourceMappingURL=user.controller.js.map