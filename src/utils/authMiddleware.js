import jwt from 'jsonwebtoken';
import { ApiError } from './errorHandler.js';
import { getEnv } from './getEnv.js';

export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    const bearerToken =
      authHeader && authHeader.startsWith('Bearer ')
        ? authHeader.substring(7)
        : undefined;
    const queryToken =
      typeof req.query.token === 'string' && req.query.token.length > 0 ? req.query.token : undefined;
    const token = bearerToken ?? queryToken;

    if (!token) {
      throw new ApiError('Authorization token required', 401);
    }

    try {
      const decoded = jwt.verify(token, getEnv('JWT_SECRET'));
      
      req.user = {
        id: decoded.sub,
        role: decoded.role,
      };
      
      next();
    } catch (error) {
      throw new ApiError('Invalid or expired token', 401);
    }
  } catch (error) {
    if (error instanceof ApiError) {
      next(error);
    } else {
      next(new ApiError('Authentication failed', 401));
    }
  }
};
