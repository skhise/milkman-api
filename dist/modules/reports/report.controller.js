"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadReport = exports.getRevenueReport = exports.getProductSales = exports.getCustomerConsumption = void 0;
const report_service_1 = require("./report.service");
const getCustomerConsumption = async (req, res, next) => {
    try {
        const report = await report_service_1.reportService.customerConsumption(req.params.sellerId, req.query);
        res.json(report);
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerConsumption = getCustomerConsumption;
const getProductSales = async (req, res, next) => {
    try {
        const report = await report_service_1.reportService.productSales(req.params.sellerId, req.query);
        res.json(report);
    }
    catch (error) {
        next(error);
    }
};
exports.getProductSales = getProductSales;
const getRevenueReport = async (req, res, next) => {
    try {
        const report = await report_service_1.reportService.revenue(req.params.sellerId, req.query);
        res.json(report);
    }
    catch (error) {
        next(error);
    }
};
exports.getRevenueReport = getRevenueReport;
const downloadReport = async (req, res, next) => {
    try {
        const file = await report_service_1.reportService.download(req.params.type, req.query);
        res.setHeader('Content-Type', file.mimeType);
        res.send(file.buffer);
    }
    catch (error) {
        next(error);
    }
};
exports.downloadReport = downloadReport;
//# sourceMappingURL=report.controller.js.map