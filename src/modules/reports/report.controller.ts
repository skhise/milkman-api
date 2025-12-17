import { Request, Response, NextFunction } from 'express';
import { reportService } from './report.service';

export const getCustomerConsumption = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await reportService.customerConsumption(req.params.sellerId!, req.query);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const getProductSales = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await reportService.productSales(req.params.sellerId!, req.query);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const getRevenueReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await reportService.revenue(req.params.sellerId!, req.query);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const downloadReport = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = await reportService.download(req.params.type!, req.query);
    res.setHeader('Content-Type', file.mimeType);
    res.send(file.buffer);
  } catch (error) {
    next(error);
  }
};
