"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.assignPlan = exports.deletePlan = exports.updatePlan = exports.createPlan = exports.listPlans = void 0;
const subscription_service_1 = require("./subscription.service");
const listPlans = async (_req, res, next) => {
    try {
        const plans = await subscription_service_1.subscriptionService.listPlans();
        res.json({ plans });
    }
    catch (error) {
        next(error);
    }
};
exports.listPlans = listPlans;
const createPlan = async (req, res, next) => {
    try {
        const plan = await subscription_service_1.subscriptionService.createPlan(req.body);
        res.status(201).json(plan);
    }
    catch (error) {
        next(error);
    }
};
exports.createPlan = createPlan;
const updatePlan = async (req, res, next) => {
    try {
        const plan = await subscription_service_1.subscriptionService.updatePlan(req.params.planId, req.body);
        res.json(plan);
    }
    catch (error) {
        next(error);
    }
};
exports.updatePlan = updatePlan;
const deletePlan = async (req, res, next) => {
    try {
        const plan = await subscription_service_1.subscriptionService.softDeletePlan(req.params.planId);
        res.json(plan);
    }
    catch (error) {
        next(error);
    }
};
exports.deletePlan = deletePlan;
const assignPlan = async (req, res, next) => {
    try {
        const subscription = await subscription_service_1.subscriptionService.assignPlan(req.params.sellerId, req.body);
        res.json(subscription);
    }
    catch (error) {
        next(error);
    }
};
exports.assignPlan = assignPlan;
//# sourceMappingURL=subscription.controller.js.map