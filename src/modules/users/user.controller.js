import { userService } from './user.service.js';

export const getUserDashboard = async (req, res, next) => {
  try {
    const dashboard = await userService.dashboard(req.params.userId);
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};

export const markBillPaid = async (req, res, next) => {
  try {
    const payment = await userService.markBillPaid(req.params.billId, req.body);
    res.json(payment);
  } catch (error) {
    next(error);
  }
};

export const getConsumption = async (req, res, next) => {
  try {
    const report = await userService.consumption(req.params.userId, req.query);
    res.json(report);
  } catch (error) {
    next(error);
  }
};
