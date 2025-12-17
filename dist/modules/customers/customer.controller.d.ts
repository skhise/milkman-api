import { Request, Response, NextFunction } from 'express';
export declare const createCustomer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateCustomer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const toggleCustomer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const listCustomers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const resetCustomerPin: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const exitCustomer: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getCustomerByUserId: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const setPauseWindow: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getPauseHistory: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const cancelPause: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=customer.controller.d.ts.map