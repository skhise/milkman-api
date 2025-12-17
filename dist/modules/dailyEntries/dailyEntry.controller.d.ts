import { Request, Response, NextFunction } from 'express';
export declare const listEntries: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createEntry: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const generateDailyEntries: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const updateEntry: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteEntry: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const markDelivery: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=dailyEntry.controller.d.ts.map