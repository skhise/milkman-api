import { dailyEntryService } from './dailyEntry.service.js';

export const listEntries = async (req, res, next) => {
  try {
    const entries = await dailyEntryService.list(req.params.sellerId, req.query);
    res.json(entries);
  } catch (error) {
    next(error);
  }
};

export const createEntry = async (req, res, next) => {
  try {
    const sellerId = req.params.sellerId;
    if (!sellerId) {
      return res.status(400).json({ error: 'Seller ID is required' });
    }
    const entry = await dailyEntryService.create(sellerId, req.body);
    res.status(201).json(entry);
  } catch (error) {
    next(error);
  }
};

export const generateDailyEntries = async (req, res, next) => {
  try {
    const sellerId = req.params.sellerId;
    if (!sellerId) {
      return res.status(400).json({ error: 'Seller ID is required' });
    }
    const entryDate = req.body.entryDate || new Date().toISOString().split('T')[0];
    const result = await dailyEntryService.generateDailyEntriesForSeller(sellerId, entryDate);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const updateEntry = async (req, res, next) => {
  try {
    const entry = await dailyEntryService.update(req.params.entryId, req.body);
    res.json(entry);
  } catch (error) {
    next(error);
  }
};

export const deleteEntry = async (req, res, next) => {
  try {
    const result = await dailyEntryService.delete(req.params.entryId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const markDelivery = async (req, res, next) => {
  try {
    const entry = await dailyEntryService.markDelivery(req.params.entryId, req.body);
    res.json(entry);
  } catch (error) {
    next(error);
  }
};
