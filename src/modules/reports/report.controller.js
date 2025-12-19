import { reportService } from './report.service.js';

export const getCustomerConsumption = async (req, res, next) => {
  try {
    const report = await reportService.customerConsumption(req.params.sellerId, req.query);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const getProductSales = async (req, res, next) => {
  try {
    const report = await reportService.productSales(req.params.sellerId, req.query);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const getRevenueReport = async (req, res, next) => {
  try {
    const report = await reportService.revenue(req.params.sellerId, req.query);
    res.json(report);
  } catch (error) {
    next(error);
  }
};

export const downloadReport = async (req, res, next) => {
  try {
    const file = await reportService.download(req.params.type, req.query);
    res.setHeader('Content-Type', file.mimeType);
    res.send(file.buffer);
  } catch (error) {
    next(error);
  }
};
