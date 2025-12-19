import { walletService } from './wallet.service.js';

export const addFunds = async (req, res, next) => {
  try {
    const wallet = await walletService.addFunds(req.params.customerId, req.body);
    res.json(wallet);
  } catch (error) {
    next(error);
  }
};

export const deductFunds = async (req, res, next) => {
  try {
    const wallet = await walletService.deductFunds(req.params.customerId, req.body);
    res.json(wallet);
  } catch (error) {
    next(error);
  }
};

export const getWallet = async (req, res, next) => {
  try {
    const wallet = await walletService.getWallet(req.params.customerId);
    res.json(wallet);
  } catch (error) {
    next(error);
  }
};
