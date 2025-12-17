"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_controller_1 = require("./auth.controller");
const authMiddleware_1 = require("../../utils/authMiddleware");
const router = (0, express_1.Router)();
router.post('/login', auth_controller_1.login);
router.post('/seller/register', auth_controller_1.registerSeller);
router.post('/pin/forgot', auth_controller_1.requestPinReset);
router.post('/pin/verify', auth_controller_1.verifyOtp);
router.post('/pin/reset', auth_controller_1.resetPin);
router.post('/pin/change', authMiddleware_1.authenticate, auth_controller_1.changePin);
exports.default = router;
//# sourceMappingURL=auth.routes.js.map