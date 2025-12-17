import { Request, Response, NextFunction } from 'express';
import { walletService } from './wallet.service';

export const addFunds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = await walletService.addFunds(req.params.customerId!, req.body);
    res.json(wallet);
  } catch (error) {
    next(error);
  }
};

export const deductFunds = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = await walletService.deductFunds(req.params.customerId!, req.body);
    res.json(wallet);
  } catch (error) {
    next(error);
  }
};

export const getWallet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const wallet = await walletService.getWallet(req.params.customerId!);
    res.json(wallet);
  } catch (error) {
    next(error);
  }
};
