"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authenticate = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("./errorHandler");
const getEnv_1 = require("./getEnv");
const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        const bearerToken = authHeader && authHeader.startsWith('Bearer ')
            ? authHeader.substring(7)
            : undefined;
        const queryToken = typeof req.query.token === 'string' && req.query.token.length > 0 ? req.query.token : undefined;
        const token = bearerToken ?? queryToken;
        if (!token) {
            throw new errorHandler_1.ApiError('Authorization token required', 401);
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, (0, getEnv_1.getEnv)('JWT_SECRET'));
            req.user = {
                id: decoded.sub,
                role: decoded.role,
            };
            next();
        }
        catch (error) {
            throw new errorHandler_1.ApiError('Invalid or expired token', 401);
        }
    }
    catch (error) {
        if (error instanceof errorHandler_1.ApiError) {
            next(error);
        }
        else {
            next(new errorHandler_1.ApiError('Authentication failed', 401));
        }
    }
};
exports.authenticate = authenticate;
//# sourceMappingURL=authMiddleware.js.map