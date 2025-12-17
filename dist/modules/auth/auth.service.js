"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const errorHandler_1 = require("../../utils/errorHandler");
const getEnv_1 = require("../../utils/getEnv");
const zod_1 = require("zod");
const connection_1 = require("../../database/connection");
const crypto_1 = require("crypto");
const loginSchema = zod_1.z.object({
    mobile: zod_1.z.string().min(10),
    pin: zod_1.z.string().min(4),
});
const registerSchema = zod_1.z.object({
    name: zod_1.z.string(),
    mobile: zod_1.z.string(),
    email: zod_1.z.string().email(),
    pin: zod_1.z.string().min(4),
    subscriptionPlanId: zod_1.z.string(),
});
const otpSchema = zod_1.z.object({
    email: zod_1.z.string().email().optional(),
    mobile: zod_1.z.string().optional(),
});
const verifySchema = zod_1.z.object({
    otp: zod_1.z.string(),
    reference: zod_1.z.string(),
});
const changePinSchema = zod_1.z.object({
    currentPin: zod_1.z.string().min(4),
    newPin: zod_1.z.string().min(4),
});
const resetPinSchema = zod_1.z.object({
    reference: zod_1.z.string(),
    newPin: zod_1.z.string().min(4),
});
class AuthService {
    async login(payload) {
        let data;
        try {
            data = loginSchema.parse(payload);
        }
        catch (error) {
            throw new errorHandler_1.ApiError(error.message || 'Invalid request data', 400);
        }
        let db;
        try {
            db = (0, connection_1.getDb)();
        }
        catch (error) {
            throw new errorHandler_1.ApiError('Database connection error', 500);
        }
        // Fetch user from database by mobile
        const user = await db('users')
            .where({ mobile: data.mobile })
            .first();
        if (!user) {
            throw new errorHandler_1.ApiError('Invalid credentials', 401);
        }
        // Verify PIN
        const isPinValid = await bcryptjs_1.default.compare(data.pin, user.pin_hash);
        if (!isPinValid) {
            throw new errorHandler_1.ApiError('Invalid credentials', 401);
        }
        // Check if user is active
        if (user.status !== 'active') {
            throw new errorHandler_1.ApiError('Account is not active', 403);
        }
        // Update last login
        await db('users')
            .where({ id: user.id })
            .update({ last_login_at: db.fn.now() });
        let sellerId = null;
        if (user.role === 'seller') {
            const sellerRow = await db('sellers').select('id').where({ user_id: user.id }).first();
            sellerId = sellerRow?.id ?? null;
        }
        const tokenPayload = {
            sub: user.id,
            role: user.role,
        };
        if (sellerId) {
            tokenPayload.sellerId = sellerId;
        }
        // Generate token
        const token = jsonwebtoken_1.default.sign(tokenPayload, (0, getEnv_1.getEnv)('JWT_SECRET', 'super-secret'), { expiresIn: '12h' });
        // Return token and user data
        return {
            token,
            user: {
                id: user.id,
                mobile: user.mobile,
                role: user.role,
                name: user.name,
                email: user.email,
                sellerId,
            },
        };
    }
    async registerSeller(payload) {
        const data = registerSchema.parse(payload);
        // TODO: persist seller and send verification email
        return { id: 'seller-id', ...data, status: 'pending_verification' };
    }
    async requestPinReset(payload) {
        let data;
        try {
            data = otpSchema.parse(payload);
        }
        catch (error) {
            throw new errorHandler_1.ApiError(error.message || 'Invalid request data', 400);
        }
        if (!data.email && !data.mobile) {
            throw new errorHandler_1.ApiError('Email or mobile required', 400);
        }
        let db;
        try {
            db = (0, connection_1.getDb)();
        }
        catch (error) {
            throw new errorHandler_1.ApiError('Database connection error', 500);
        }
        // Find user by email or mobile
        let user;
        if (data.email) {
            user = await db('users').where({ email: data.email }).first();
        }
        else if (data.mobile) {
            user = await db('users').where({ mobile: data.mobile }).first();
        }
        if (!user) {
            // Don't reveal if user exists for security reasons
            // Return success message even if user doesn't exist
            return { message: 'If the account exists, reset instructions have been sent' };
        }
        // Check if user is active
        if (user.status !== 'active') {
            throw new errorHandler_1.ApiError('Account is not active', 403);
        }
        // Generate 6-digit OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        // Generate unique reference
        const reference = (0, crypto_1.randomUUID)();
        // Invalidate any existing pending tokens for this user
        await db('pin_reset_tokens')
            .where({ user_id: user.id, status: 'pending' })
            .update({ status: 'expired' });
        // Store OTP in database - use database date function for expiration
        await db('pin_reset_tokens').insert({
            id: (0, crypto_1.randomUUID)(),
            user_id: user.id,
            otp: otp,
            reference: reference,
            status: 'pending',
            expires_at: db.raw('DATE_ADD(NOW(), INTERVAL 10 MINUTE)'),
        });
        // TODO: Send OTP via email or SMS
        // For now, we'll return the OTP in development (remove in production)
        // In production, send OTP via email/SMS and don't return it
        return {
            message: 'Reset instructions sent',
            reference: reference,
            // Remove this in production - only for development/testing
            otp: process.env.NODE_ENV === 'development' ? otp : undefined,
        };
    }
    async verifyOtp(payload) {
        let data;
        try {
            data = verifySchema.parse(payload);
        }
        catch (error) {
            throw new errorHandler_1.ApiError(error.message || 'Invalid request data', 400);
        }
        let db;
        try {
            db = (0, connection_1.getDb)();
        }
        catch (error) {
            throw new errorHandler_1.ApiError('Database connection error', 500);
        }
        // Find the reset token by reference (check all statuses first)
        const resetToken = await db('pin_reset_tokens')
            .where({ reference: data.reference })
            .first();
        if (!resetToken) {
            throw new errorHandler_1.ApiError('Invalid reset token. Please request a new PIN reset', 400);
        }
        // Check if token has expired using database time comparison
        const isExpired = await db('pin_reset_tokens')
            .where({ id: resetToken.id })
            .whereRaw('expires_at < NOW()')
            .count('* as count')
            .first();
        if (isExpired && Number(isExpired.count) > 0) {
            // Update status to expired if not already
            if (resetToken.status !== 'expired') {
                await db('pin_reset_tokens')
                    .where({ id: resetToken.id })
                    .update({ status: 'expired' });
            }
            throw new errorHandler_1.ApiError('Reset token has expired. Please request a new PIN reset', 400);
        }
        // Check if token status is valid for verification
        if (resetToken.status !== 'pending') {
            if (resetToken.status === 'used') {
                throw new errorHandler_1.ApiError('This reset token has already been used. Please request a new PIN reset', 400);
            }
            if (resetToken.status === 'expired') {
                throw new errorHandler_1.ApiError('Reset token has expired. Please request a new PIN reset', 400);
            }
            if (resetToken.status === 'verified') {
                throw new errorHandler_1.ApiError('OTP has already been verified. You can now reset your PIN', 400);
            }
            throw new errorHandler_1.ApiError('Invalid token status. Please request a new PIN reset', 400);
        }
        // Verify OTP
        if (resetToken.otp !== data.otp) {
            throw new errorHandler_1.ApiError('Invalid OTP', 400);
        }
        // Mark token as verified and extend expiration by 10 minutes using database time
        // Use database date arithmetic to avoid timezone issues
        const updateResult = await db('pin_reset_tokens')
            .where({ id: resetToken.id })
            .update({
            status: 'verified',
            expires_at: db.raw('DATE_ADD(NOW(), INTERVAL 10 MINUTE)'),
        });
        // Verify the update was successful
        if (updateResult === 0) {
            throw new errorHandler_1.ApiError('Failed to verify token', 500);
        }
        // Generate temporary token for PIN reset (valid for 10 minutes)
        const tempToken = jsonwebtoken_1.default.sign({
            sub: resetToken.user_id,
            type: 'pin_reset',
            reference: data.reference,
        }, (0, getEnv_1.getEnv)('JWT_SECRET', 'super-secret'), { expiresIn: '10m' });
        return {
            reference: data.reference,
            token: tempToken,
        };
    }
    async changePin(userId, payload) {
        let data;
        try {
            data = changePinSchema.parse(payload);
        }
        catch (error) {
            throw new errorHandler_1.ApiError(error.message || 'Invalid request data', 400);
        }
        let db;
        try {
            db = (0, connection_1.getDb)();
        }
        catch (error) {
            throw new errorHandler_1.ApiError('Database connection error', 500);
        }
        // Fetch user from database
        const user = await db('users')
            .where({ id: userId })
            .first();
        if (!user) {
            throw new errorHandler_1.ApiError('User not found', 404);
        }
        // Verify current PIN
        const isPinValid = await bcryptjs_1.default.compare(data.currentPin, user.pin_hash);
        if (!isPinValid) {
            throw new errorHandler_1.ApiError('Current PIN is incorrect', 401);
        }
        // Hash new PIN
        const saltRounds = 10;
        const newPinHash = await bcryptjs_1.default.hash(data.newPin, saltRounds);
        // Update PIN in database
        await db('users')
            .where({ id: userId })
            .update({
            pin_hash: newPinHash,
            updated_at: db.fn.now(),
        });
        return { message: 'PIN changed successfully' };
    }
    async resetPin(payload) {
        let data;
        try {
            data = resetPinSchema.parse(payload);
        }
        catch (error) {
            throw new errorHandler_1.ApiError(error.message || 'Invalid request data', 400);
        }
        let db;
        try {
            db = (0, connection_1.getDb)();
        }
        catch (error) {
            throw new errorHandler_1.ApiError('Database connection error', 500);
        }
        // Find the reset token by reference - must be verified status
        const resetToken = await db('pin_reset_tokens')
            .where({ reference: data.reference, status: 'verified' })
            .first();
        if (!resetToken) {
            // Check if token exists but in different status for better error messages
            const existingToken = await db('pin_reset_tokens')
                .where({ reference: data.reference })
                .first();
            if (!existingToken) {
                throw new errorHandler_1.ApiError('Invalid reset token. Please request a new PIN reset', 400);
            }
            // Provide specific error messages based on status
            if (existingToken.status === 'used') {
                throw new errorHandler_1.ApiError('This reset token has already been used. Please request a new PIN reset', 400);
            }
            if (existingToken.status === 'expired') {
                throw new errorHandler_1.ApiError('Reset token has expired. Please request a new PIN reset', 400);
            }
            if (existingToken.status === 'pending') {
                throw new errorHandler_1.ApiError('Please verify your OTP first before resetting your PIN', 400);
            }
            throw new errorHandler_1.ApiError('Invalid reset token. Please verify your OTP first or request a new PIN reset', 400);
        }
        // Check if token has expired using database time comparison
        const isExpired = await db('pin_reset_tokens')
            .where({ id: resetToken.id })
            .whereRaw('expires_at < NOW()')
            .count('* as count')
            .first();
        if (isExpired && Number(isExpired.count) > 0) {
            await db('pin_reset_tokens')
                .where({ id: resetToken.id })
                .update({ status: 'expired' });
            throw new errorHandler_1.ApiError('Reset token has expired. Please request a new PIN reset', 400);
        }
        // Check if token has already been used (double-check)
        if (resetToken.status === 'used') {
            throw new errorHandler_1.ApiError('This reset token has already been used. Please request a new PIN reset', 400);
        }
        // Fetch user from database
        const user = await db('users')
            .where({ id: resetToken.user_id })
            .first();
        if (!user) {
            throw new errorHandler_1.ApiError('User not found', 404);
        }
        // Hash new PIN
        const saltRounds = 10;
        const newPinHash = await bcryptjs_1.default.hash(data.newPin, saltRounds);
        // Update PIN in database
        await db('users')
            .where({ id: user.id })
            .update({
            pin_hash: newPinHash,
            updated_at: db.fn.now(),
        });
        // Mark token as used
        await db('pin_reset_tokens')
            .where({ id: resetToken.id })
            .update({ status: 'used' });
        return { message: 'PIN reset successfully' };
    }
}
exports.authService = new AuthService();
//# sourceMappingURL=auth.service.js.map