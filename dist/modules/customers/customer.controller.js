"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cancelPause = exports.getPauseHistory = exports.setPauseWindow = exports.getCustomerByUserId = exports.exitCustomer = exports.resetCustomerPin = exports.listCustomers = exports.toggleCustomer = exports.updateCustomer = exports.createCustomer = void 0;
const customer_service_1 = require("./customer.service");
const createCustomer = async (req, res, next) => {
    try {
        const customer = await customer_service_1.customerService.create(req.params.sellerId, req.body);
        res.status(201).json(customer);
    }
    catch (error) {
        next(error);
    }
};
exports.createCustomer = createCustomer;
const updateCustomer = async (req, res, next) => {
    try {
        const customer = await customer_service_1.customerService.update(req.params.customerId, req.body);
        res.json({ customer });
    }
    catch (error) {
        next(error);
    }
};
exports.updateCustomer = updateCustomer;
const toggleCustomer = async (req, res, next) => {
    try {
        const data = await customer_service_1.customerService.toggleStatus(req.params.customerId, req.body);
        res.json(data);
    }
    catch (error) {
        next(error);
    }
};
exports.toggleCustomer = toggleCustomer;
const listCustomers = async (req, res, next) => {
    try {
        const customers = await customer_service_1.customerService.list(req.params.sellerId, req.query);
        res.json(customers);
    }
    catch (error) {
        next(error);
    }
};
exports.listCustomers = listCustomers;
const resetCustomerPin = async (req, res, next) => {
    try {
        const result = await customer_service_1.customerService.resetPin(req.params.customerId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.resetCustomerPin = resetCustomerPin;
const exitCustomer = async (req, res, next) => {
    try {
        const result = await customer_service_1.customerService.exit(req.params.customerId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.exitCustomer = exitCustomer;
const getCustomerByUserId = async (req, res, next) => {
    try {
        const customer = await customer_service_1.customerService.getByUserId(req.params.userId);
        res.json(customer);
    }
    catch (error) {
        next(error);
    }
};
exports.getCustomerByUserId = getCustomerByUserId;
const setPauseWindow = async (req, res, next) => {
    try {
        const result = await customer_service_1.customerService.setPauseWindow(req.params.customerId, req.body);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.setPauseWindow = setPauseWindow;
const getPauseHistory = async (req, res, next) => {
    try {
        const history = await customer_service_1.customerService.getPauseHistory(req.params.customerId);
        res.json({ history });
    }
    catch (error) {
        next(error);
    }
};
exports.getPauseHistory = getPauseHistory;
const cancelPause = async (req, res, next) => {
    try {
        const result = await customer_service_1.customerService.cancelPause(req.params.customerId, req.params.pauseId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.cancelPause = cancelPause;
//# sourceMappingURL=customer.controller.js.map