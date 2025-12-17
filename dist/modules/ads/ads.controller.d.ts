import { Request, Response, NextFunction } from 'express';
export declare const listAds: (_req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const createAd: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateAd: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const recordClick: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
export declare const getAdStats: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
//# sourceMappingURL=ads.controller.d.ts.map