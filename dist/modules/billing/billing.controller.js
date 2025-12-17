"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.downloadBillPdf = exports.getBillDetails = exports.deleteBill = exports.listBills = exports.markUnpaid = exports.markPaid = exports.sendReminder = exports.updateBill = exports.generateAllBills = exports.issueBill = exports.generateMonthlyBill = void 0;
const billing_service_1 = require("./billing.service");
const generateMonthlyBill = async (req, res, next) => {
    try {
        const bill = await billing_service_1.billingService.generate(req.params.sellerId, req.params.customerId, req.query);
        res.json(bill);
    }
    catch (error) {
        next(error);
    }
};
exports.generateMonthlyBill = generateMonthlyBill;
const issueBill = async (req, res, next) => {
    try {
        const bill = await billing_service_1.billingService.issueBill(req.params.billId);
        res.json(bill);
    }
    catch (error) {
        next(error);
    }
};
exports.issueBill = issueBill;
const generateAllBills = async (req, res, next) => {
    try {
        const result = await billing_service_1.billingService.generateMonthlyBillsForSeller(req.params.sellerId, req.query.month, req.query.year);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.generateAllBills = generateAllBills;
const updateBill = async (req, res, next) => {
    try {
        const bill = await billing_service_1.billingService.update(req.params.billId, req.body);
        res.json(bill);
    }
    catch (error) {
        next(error);
    }
};
exports.updateBill = updateBill;
const sendReminder = async (req, res, next) => {
    try {
        await billing_service_1.billingService.sendReminder(req.params.billId, req.body);
        res.json({ message: 'Reminder sent' });
    }
    catch (error) {
        next(error);
    }
};
exports.sendReminder = sendReminder;
const markPaid = async (req, res, next) => {
    try {
        const payment = await billing_service_1.billingService.markPaid(req.params.billId, req.body);
        res.json(payment);
    }
    catch (error) {
        next(error);
    }
};
exports.markPaid = markPaid;
const markUnpaid = async (req, res, next) => {
    try {
        const bill = await billing_service_1.billingService.markUnpaid(req.params.billId);
        res.json(bill);
    }
    catch (error) {
        next(error);
    }
};
exports.markUnpaid = markUnpaid;
const listBills = async (req, res, next) => {
    try {
        const bills = await billing_service_1.billingService.listBills(req.params.sellerId, req.query);
        res.json(bills);
    }
    catch (error) {
        next(error);
    }
};
exports.listBills = listBills;
const deleteBill = async (req, res, next) => {
    try {
        await billing_service_1.billingService.deleteBill(req.params.billId);
        res.json({ message: 'Bill deleted successfully' });
    }
    catch (error) {
        next(error);
    }
};
exports.deleteBill = deleteBill;
const getBillDetails = async (req, res, next) => {
    try {
        const bill = await billing_service_1.billingService.getBillWithItems(req.params.billId);
        res.json(bill);
    }
    catch (error) {
        next(error);
    }
};
exports.getBillDetails = getBillDetails;
const downloadBillPdf = async (req, res, next) => {
    try {
        const { buffer, filename } = await billing_service_1.billingService.generateInvoicePdf(req.params.billId);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        res.send(buffer);
    }
    catch (error) {
        next(error);
    }
};
exports.downloadBillPdf = downloadBillPdf;
//# sourceMappingURL=billing.controller.js.map