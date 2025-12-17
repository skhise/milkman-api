"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markSubscriptionCollectionPaid = exports.listSubscriptionCollections = void 0;
const payment_service_1 = require("./payment.service");
const listSubscriptionCollections = async (req, res, next) => {
    try {
        const collections = await payment_service_1.paymentService.listSubscriptionCollections(req.query);
        res.json({ collections });
    }
    catch (error) {
        next(error);
    }
};
exports.listSubscriptionCollections = listSubscriptionCollections;
const markSubscriptionCollectionPaid = async (req, res, next) => {
    try {
        const collection = await payment_service_1.paymentService.markSubscriptionCollectionPaid(req.params.collectionId, req.body);
        res.json(collection);
    }
    catch (error) {
        next(error);
    }
};
exports.markSubscriptionCollectionPaid = markSubscriptionCollectionPaid;
//# sourceMappingURL=payment.controller.js.map