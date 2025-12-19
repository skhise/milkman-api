import { authService } from './auth.service.js';

export const login = async (req, res, next) => {
  try {
    const data = await authService.login(req.body);
    res.json(data);
  } catch (error) {
    next(error);
  }
};

export const registerSeller = async (req, res, next) => {
  try {
    const seller = await authService.registerSeller(req.body);
    res.status(201).json(seller);
  } catch (error) {
    next(error);
  }
};

export const requestPinReset = async (req, res, next) => {
  try {
    const result = await authService.requestPinReset(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const verifyOtp = async (req, res, next) => {
  try {
    const token = await authService.verifyOtp(req.body);
    res.json(token);
  } catch (error) {
    next(error);
  }
};

export const changePin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ message: 'Unauthorized' });
    }
    const result = await authService.changePin(req.user.id, req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const resetPin = async (req, res, next) => {
  try {
    const result = await authService.resetPin(req.body);
    res.json(result);
  } catch (error) {
    next(error);
  }
};
