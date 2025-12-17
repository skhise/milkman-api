import { Request, Response, NextFunction } from 'express';
export declare const generateMonthlyBill: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const issueBill: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const generateAllBills: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const updateBill: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const sendReminder: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const markPaid: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const markUnpaid: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const listBills: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const deleteBill: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const getBillDetails: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const downloadBillPdf: (req: Request, res: Response, next: NextFunction) => Promise<void>;
//# sourceMappingURL=billing.controller.d.ts.map