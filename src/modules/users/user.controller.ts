import { Request, Response, NextFunction } from 'express';
import { userService } from './user.service';

export const getUserDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dashboard = await userService.dashboard(req.params.userId!);
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};

export const markBillPaid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const payment = await userService.markBillPaid(req.params.billId!, req.body);
    res.json(payment);
  } catch (error) {
    next(error);
  }
};

export const getConsumption = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await userService.consumption(req.params.userId!, req.query);
    res.json(report);
  } catch (error) {
    next(error);
  }
};
