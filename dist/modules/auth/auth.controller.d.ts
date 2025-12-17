import { Request, Response, NextFunction } from 'express';
import { AuthRequest } from '../../utils/authMiddleware';
export declare const login: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const registerSeller: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const requestPinReset: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const verifyOtp: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const changePin: (req: AuthRequest, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const resetPin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=auth.controller.d.ts.map