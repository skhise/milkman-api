import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { ApiError } from '../../utils/errorHandler.js';
import { getEnv } from '../../utils/getEnv.js';
import { z } from 'zod';
import { getDb } from '../../database/connection.js';
import { randomUUID } from 'crypto';
import { messagingService } from '../../services/messaging.service.js';

const loginSchema = z.object({
  mobile: z.string().min(10),
  pin: z.string().min(4),
});

const registerSchema = z.object({
  name: z.string(),
  mobile: z.string(),
  email: z.string().email(),
  pin: z.string().min(4),
  subscriptionPlanId: z.string(),
});

const otpSchema = z.object({
  email: z.string().email().optional(),
  mobile: z.string().optional(),
});

const verifySchema = z.object({
  otp: z.string(),
  reference: z.string(),
});

const changePinSchema = z.object({
  currentPin: z.string().min(4),
  newPin: z.string().min(4),
});

const resetPinSchema = z.object({
  reference: z.string(),
  newPin: z.string().min(4),
});

class AuthService {
  async login(payload) {
    let data;
    try {
      data = loginSchema.parse(payload);
    } catch (error) {
      throw new ApiError(error.message || 'Invalid request data', 400);
    }

    let db;
    try {
      db = getDb();
    } catch (error) {
      throw new ApiError('Database connection error', 500);
    }

    // Fetch user from database by mobile
    const user = await db('users')
      .where({ mobile: data.mobile })
      .first();

    if (!user) {
      throw new ApiError('Invalid credentials', 401);
    }

    // Verify PIN
    const isPinValid = await bcrypt.compare(data.pin, user.pin_hash);
    if (!isPinValid) {
      throw new ApiError('Invalid credentials', 401);
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new ApiError('Account is not active', 403);
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
    const token = jwt.sign(
      tokenPayload,
      getEnv('JWT_SECRET'),
      { expiresIn: '12h' },
    );

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
    } catch (error) {
      throw new ApiError(error.message || 'Invalid request data', 400);
    }

    if (!data.email && !data.mobile) {
      throw new ApiError('Email or mobile required', 400);
    }

    let db;
    try {
      db = getDb();
    } catch (error) {
      throw new ApiError('Database connection error', 500);
    }

    // Find user by email or mobile
    let user;
    if (data.email) {
      user = await db('users').where({ email: data.email }).first();
    } else if (data.mobile) {
      user = await db('users').where({ mobile: data.mobile }).first();
    }

    if (!user) {
      // Don't reveal if user exists for security reasons
      // Return success message even if user doesn't exist
      return { message: 'If the account exists, reset instructions have been sent' };
    }

    // Check if user is active
    if (user.status !== 'active') {
      throw new ApiError('Account is not active', 403);
    }

    // Generate unique reference for PIN reset
    const reference = randomUUID();

    // Invalidate any existing pending tokens for this user
    await db('pin_reset_tokens')
      .where({ user_id: user.id, status: 'pending' })
      .update({ status: 'expired' });

    // Store reset token in database - valid for 10 minutes
    await db('pin_reset_tokens').insert({
      id: randomUUID(),
      user_id: user.id,
      otp: null, // No OTP needed
      reference: reference,
      status: 'pending',
      expires_at: db.raw('DATE_ADD(NOW(), INTERVAL 10 MINUTE)'),
    });

    return {
      message: 'Mobile number verified. You can now reset your PIN.',
      reference: reference,
    };
  }

  async verifyOtp(payload) {
    let data;
    try {
      data = verifySchema.parse(payload);
    } catch (error) {
      throw new ApiError(error.message || 'Invalid request data', 400);
    }

    let db;
    try {
      db = getDb();
    } catch (error) {
      throw new ApiError('Database connection error', 500);
    }

    // Find the reset token by reference (check all statuses first)
    const resetToken = await db('pin_reset_tokens')
      .where({ reference: data.reference })
      .first();

    if (!resetToken) {
      throw new ApiError('Invalid reset token. Please request a new PIN reset', 400);
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
      throw new ApiError('Reset token has expired. Please request a new PIN reset', 400);
    }

    // Check if token status is valid for verification
    if (resetToken.status !== 'pending') {
      if (resetToken.status === 'used') {
        throw new ApiError('This reset token has already been used. Please request a new PIN reset', 400);
      }
      if (resetToken.status === 'expired') {
        throw new ApiError('Reset token has expired. Please request a new PIN reset', 400);
      }
      // Allow PIN reset directly without OTP verification
      throw new ApiError('Invalid token status. Please request a new PIN reset', 400);
    }

    // Verify OTP
    if (resetToken.otp !== data.otp) {
      throw new ApiError('Invalid OTP', 400);
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
      throw new ApiError('Failed to verify token', 500);
    }

    // Generate temporary token for PIN reset (valid for 10 minutes)
    const tempToken = jwt.sign(
      { 
        sub: resetToken.user_id, 
        type: 'pin_reset',
        reference: data.reference,
      },
      getEnv('JWT_SECRET'),
      { expiresIn: '10m' },
    );

    return { 
      reference: data.reference, 
      token: tempToken,
    };
  }

  async changePin(userId, payload) {
    let data;
    try {
      data = changePinSchema.parse(payload);
    } catch (error) {
      throw new ApiError(error.message || 'Invalid request data', 400);
    }

    let db;
    try {
      db = getDb();
    } catch (error) {
      throw new ApiError('Database connection error', 500);
    }

    // Fetch user from database
    const user = await db('users')
      .where({ id: userId })
      .first();

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Verify current PIN
    const isPinValid = await bcrypt.compare(data.currentPin, user.pin_hash);
    if (!isPinValid) {
      throw new ApiError('Current PIN is incorrect', 401);
    }

    // Hash new PIN
    const saltRounds = 10;
    const newPinHash = await bcrypt.hash(data.newPin, saltRounds);

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
    } catch (error) {
      throw new ApiError(error.message || 'Invalid request data', 400);
    }

    let db;
    try {
      db = getDb();
    } catch (error) {
      throw new ApiError('Database connection error', 500);
    }

    // Find the reset token by reference
    const resetToken = await db('pin_reset_tokens')
      .where({ reference: data.reference })
      .first();

    if (!resetToken) {
        throw new ApiError('Invalid reset token. Please request a new PIN reset', 400);
      }
      
    // Check token status - allow PIN reset if status is 'pending' (no OTP verification needed)
    if (resetToken.status === 'used') {
        throw new ApiError('This reset token has already been used. Please request a new PIN reset', 400);
      }
    if (resetToken.status === 'expired') {
        throw new ApiError('Reset token has expired. Please request a new PIN reset', 400);
      }
    if (resetToken.status !== 'pending') {
      throw new ApiError('Invalid reset token. Please request a new PIN reset', 400);
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
      throw new ApiError('Reset token has expired. Please request a new PIN reset', 400);
    }

    // Fetch user from database
    const user = await db('users')
      .where({ id: resetToken.user_id })
      .first();

    if (!user) {
      throw new ApiError('User not found', 404);
    }

    // Hash new PIN
    const saltRounds = 10;
    const newPinHash = await bcrypt.hash(data.newPin, saltRounds);

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

export const authService = new AuthService();
