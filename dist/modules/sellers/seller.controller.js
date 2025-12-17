"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateSeller = exports.updateSellerSubscription = exports.createSeller = exports.listSellers = exports.getAnalytics = exports.listCustomers = exports.updateProfile = exports.getDashboard = void 0;
const seller_service_1 = require("./seller.service");
const getDashboard = async (req, res, next) => {
    try {
        const dashboard = await seller_service_1.sellerService.getDashboard(req.params.sellerId);
        res.json(dashboard);
    }
    catch (error) {
        next(error);
    }
};
exports.getDashboard = getDashboard;
const updateProfile = async (req, res, next) => {
    try {
        const seller = await seller_service_1.sellerService.updateProfile(req.params.sellerId, req.body);
        res.json(seller);
    }
    catch (error) {
        next(error);
    }
};
exports.updateProfile = updateProfile;
const listCustomers = async (req, res, next) => {
    try {
        const customers = await seller_service_1.sellerService.listCustomers(req.params.sellerId, req.query);
        res.json(customers);
    }
    catch (error) {
        next(error);
    }
};
exports.listCustomers = listCustomers;
const getAnalytics = async (req, res, next) => {
    try {
        const analytics = await seller_service_1.sellerService.getAnalytics(req.params.sellerId);
        res.json(analytics);
    }
    catch (error) {
        next(error);
    }
};
exports.getAnalytics = getAnalytics;
const listSellers = async (req, res, next) => {
    try {
        const sellers = await seller_service_1.sellerService.listSellers(req.query);
        res.json({ sellers });
    }
    catch (error) {
        next(error);
    }
};
exports.listSellers = listSellers;
const createSeller = async (req, res, next) => {
    try {
        const result = await seller_service_1.sellerService.createSeller(req.body);
        res.status(201).json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.createSeller = createSeller;
const updateSellerSubscription = async (req, res, next) => {
    try {
        const result = await seller_service_1.sellerService.updateSubscription(req.params.sellerId, req.body);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.updateSellerSubscription = updateSellerSubscription;
const updateSeller = async (req, res, next) => {
    try {
        const result = await seller_service_1.sellerService.updateSeller(req.params.sellerId, req.body);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.updateSeller = updateSeller;
//# sourceMappingURL=seller.controller.js.map