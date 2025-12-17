"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPin = exports.changePin = exports.verifyOtp = exports.requestPinReset = exports.registerSeller = exports.login = void 0;
const auth_service_1 = require("./auth.service");
const login = async (req, res, next) => {
    try {
        const data = await auth_service_1.authService.login(req.body);
        res.json(data);
    }
    catch (error) {
        next(error);
    }
};
exports.login = login;
const registerSeller = async (req, res, next) => {
    try {
        const seller = await auth_service_1.authService.registerSeller(req.body);
        res.status(201).json(seller);
    }
    catch (error) {
        next(error);
    }
};
exports.registerSeller = registerSeller;
const requestPinReset = async (req, res, next) => {
    try {
        const result = await auth_service_1.authService.requestPinReset(req.body);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.requestPinReset = requestPinReset;
const verifyOtp = async (req, res, next) => {
    try {
        const token = await auth_service_1.authService.verifyOtp(req.body);
        res.json(token);
    }
    catch (error) {
        next(error);
    }
};
exports.verifyOtp = verifyOtp;
const changePin = async (req, res, next) => {
    try {
        if (!req.user) {
            return res.status(401).json({ message: 'Unauthorized' });
        }
        const result = await auth_service_1.authService.changePin(req.user.id, req.body);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.changePin = changePin;
const resetPin = async (req, res, next) => {
    try {
        const result = await auth_service_1.authService.resetPin(req.body);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.resetPin = resetPin;
//# sourceMappingURL=auth.controller.js.map