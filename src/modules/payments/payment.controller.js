import { paymentService } from './payment.service.js';

export const listSubscriptionCollections = async (req, res, next) => {
  try {
    const collections = await paymentService.listSubscriptionCollections(req.query);
    res.json({ collections });
  } catch (error) {
    next(error);
  }
};

export const markSubscriptionCollectionPaid = async (req, res, next) => {
  try {
    const collection = await paymentService.markSubscriptionCollectionPaid(req.params.collectionId, req.body);
    res.json(collection);
  } catch (error) {
    next(error);
  }
};
