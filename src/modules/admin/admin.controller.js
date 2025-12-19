import { adminService } from './admin.service.js';

export const listSellers = async (_req, res, next) => {
  try {
    const sellers = await adminService.listSellers();
    res.json(sellers);
  } catch (error) {
    next(error);
  }
};

export const changeSellerStatus = async (req, res, next) => {
  try {
    const seller = await adminService.changeSellerStatus(req.params.sellerId, req.body);
    res.json(seller);
  } catch (error) {
    next(error);
  }
};

export const getGlobalReports = async (_req, res, next) => {
  try {
    const report = await adminService.globalReports();
    res.json(report);
  } catch (error) {
    next(error);
  }
};
