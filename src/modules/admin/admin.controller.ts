import { Request, Response, NextFunction } from 'express';
import { adminService } from './admin.service';

export const listSellers = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const sellers = await adminService.listSellers();
    res.json(sellers);
  } catch (error) {
    next(error);
  }
};

export const changeSellerStatus = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const seller = await adminService.changeSellerStatus(req.params.sellerId!, req.body);
    res.json(seller);
  } catch (error) {
    next(error);
  }
};

export const getGlobalReports = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await adminService.globalReports();
    res.json(report);
  } catch (error) {
    next(error);
  }
};
