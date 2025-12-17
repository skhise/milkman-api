"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWallet = exports.deductFunds = exports.addFunds = void 0;
const wallet_service_1 = require("./wallet.service");
const addFunds = async (req, res, next) => {
    try {
        const wallet = await wallet_service_1.walletService.addFunds(req.params.customerId, req.body);
        res.json(wallet);
    }
    catch (error) {
        next(error);
    }
};
exports.addFunds = addFunds;
const deductFunds = async (req, res, next) => {
    try {
        const wallet = await wallet_service_1.walletService.deductFunds(req.params.customerId, req.body);
        res.json(wallet);
    }
    catch (error) {
        next(error);
    }
};
exports.deductFunds = deductFunds;
const getWallet = async (req, res, next) => {
    try {
        const wallet = await wallet_service_1.walletService.getWallet(req.params.customerId);
        res.json(wallet);
    }
    catch (error) {
        next(error);
    }
};
exports.getWallet = getWallet;
//# sourceMappingURL=wallet.controller.js.map