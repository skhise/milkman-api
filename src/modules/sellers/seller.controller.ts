import { Request, Response, NextFunction } from 'express';
import { sellerService } from './seller.service';

export const getDashboard = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const dashboard = await sellerService.getDashboard(req.params.sellerId!);
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const seller = await sellerService.updateProfile(req.params.sellerId!, req.body);
    res.json(seller);
  } catch (error) {
    next(error);
  }
};

export const listCustomers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const customers = await sellerService.listCustomers(req.params.sellerId!, req.query);
    res.json(customers);
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const analytics = await sellerService.getAnalytics(req.params.sellerId!);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

export const listSellers = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sellers = await sellerService.listSellers(req.query);
    res.json({ sellers });
  } catch (error) {
    next(error);
  }
};

export const createSeller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await sellerService.createSeller(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateSellerSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await sellerService.updateSubscription(req.params.sellerId!, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateSeller = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await sellerService.updateSeller(req.params.sellerId!, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
