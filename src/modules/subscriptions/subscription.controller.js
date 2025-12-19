import { subscriptionService } from './subscription.service.js';

export const listPlans = async (_req, res, next) => {
  try {
    const plans = await subscriptionService.listPlans();
    res.json({ plans });
  } catch (error) {
    next(error);
  }
};

export const createPlan = async (req, res, next) => {
  try {
    const plan = await subscriptionService.createPlan(req.body);
    res.status(201).json(plan);
  } catch (error) {
    next(error);
  }
};

export const updatePlan = async (req, res, next) => {
  try {
    const plan = await subscriptionService.updatePlan(req.params.planId, req.body);
    res.json(plan);
  } catch (error) {
    next(error);
  }
};

export const deletePlan = async (req, res, next) => {
  try {
    const plan = await subscriptionService.softDeletePlan(req.params.planId);
    res.json(plan);
  } catch (error) {
    next(error);
  }
};

export const assignPlan = async (req, res, next) => {
  try {
    const subscription = await subscriptionService.assignPlan(req.params.sellerId, req.body);
    res.json(subscription);
  } catch (error) {
    next(error);
  }
};
