import { customerService } from './customer.service.js';

export const createCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.create(req.params.sellerId, req.body);
    res.status(201).json(customer);
  } catch (error) {
    next(error);
  }
};

export const updateCustomer = async (req, res, next) => {
  try {
    const customer = await customerService.update(req.params.customerId, req.body);
    res.json({ customer });
  } catch (error) {
    next(error);
  }
};

export const toggleCustomer = async (req, res, next) => {
  try {
    const data = await customerService.toggleStatus(req.params.customerId, req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const listCustomers = async (req, res, next) => {
  try {
    const customers = await customerService.list(req.params.sellerId, req.query);
    res.json(customers);
  } catch (error) {
    next(error);
  }
};

export const resetCustomerPin = async (req, res, next) => {
  try {
    const result = await customerService.resetPin(req.params.customerId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const exitCustomer = async (req, res, next) => {
  try {
    const result = await customerService.exit(req.params.customerId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getCustomerByUserId = async (req, res, next) => {
  try {
    const customer = await customerService.getByUserId(req.params.userId);
    res.json(customer);
  } catch (error) {
    next(error);
  }
};

export const setPauseWindow = async (req, res, next) => {
  try {
    const result = await customerService.setPauseWindow(req.params.customerId, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getPauseHistory = async (req, res, next) => {
  try {
    const history = await customerService.getPauseHistory(req.params.customerId);
    res.json({ history });
  } catch (error) {
    next(error);
  }
};

export const cancelPause = async (req, res, next) => {
  try {
    const result = await customerService.cancelPause(req.params.customerId, req.params.pauseId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
