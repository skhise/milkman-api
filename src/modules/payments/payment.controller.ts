import { Request, Response, NextFunction } from 'express';
import { paymentService } from './payment.service';

export const listSubscriptionCollections = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const collections = await paymentService.listSubscriptionCollections(req.query);
    res.json({ collections });
  } catch (error) {
    next(error);
  }
};

export const markSubscriptionCollectionPaid = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const collection = await paymentService.markSubscriptionCollectionPaid(req.params.collectionId!, req.body);
    res.json(collection);
  } catch (error) {
    next(error);
  }
};
