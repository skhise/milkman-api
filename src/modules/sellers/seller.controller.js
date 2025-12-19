import { sellerService } from './seller.service.js';

export const getDashboard = async (req, res, next) => {
  try {
    const dashboard = await sellerService.getDashboard(req.params.sellerId);
    res.json(dashboard);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const seller = await sellerService.updateProfile(req.params.sellerId, req.body);
    res.json(seller);
  } catch (error) {
    next(error);
  }
};

export const listCustomers = async (req, res, next) => {
  try {
    const customers = await sellerService.listCustomers(req.params.sellerId, req.query);
    res.json(customers);
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const analytics = await sellerService.getAnalytics(req.params.sellerId);
    res.json(analytics);
  } catch (error) {
    next(error);
  }
};

export const listSellers = async (req, res, next) => {
  try {
    const sellers = await sellerService.listSellers(req.query);
    res.json({ sellers });
  } catch (error) {
    next(error);
  }
};

export const createSeller = async (req, res, next) => {
  try {
    const result = await sellerService.createSeller(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
};

export const updateSellerSubscription = async (req, res, next) => {
  try {
    const result = await sellerService.updateSubscription(req.params.sellerId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateSeller = async (req, res, next) => {
  try {
    const result = await sellerService.updateSeller(req.params.sellerId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
