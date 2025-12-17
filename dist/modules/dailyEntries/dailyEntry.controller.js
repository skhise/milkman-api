"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.markDelivery = exports.deleteEntry = exports.updateEntry = exports.generateDailyEntries = exports.createEntry = exports.listEntries = void 0;
const dailyEntry_service_1 = require("./dailyEntry.service");
const listEntries = async (req, res, next) => {
    try {
        const entries = await dailyEntry_service_1.dailyEntryService.list(req.params.sellerId, req.query);
        res.json(entries);
    }
    catch (error) {
        next(error);
    }
};
exports.listEntries = listEntries;
const createEntry = async (req, res, next) => {
    try {
        const sellerId = req.params.sellerId;
        if (!sellerId) {
            return res.status(400).json({ error: 'Seller ID is required' });
        }
        const entry = await dailyEntry_service_1.dailyEntryService.create(sellerId, req.body);
        res.status(201).json(entry);
    }
    catch (error) {
        next(error);
    }
};
exports.createEntry = createEntry;
const generateDailyEntries = async (req, res, next) => {
    try {
        const sellerId = req.params.sellerId;
        if (!sellerId) {
            return res.status(400).json({ error: 'Seller ID is required' });
        }
        const entryDate = req.body.entryDate || new Date().toISOString().split('T')[0];
        const result = await dailyEntry_service_1.dailyEntryService.generateDailyEntriesForSeller(sellerId, entryDate);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.generateDailyEntries = generateDailyEntries;
const updateEntry = async (req, res, next) => {
    try {
        const entry = await dailyEntry_service_1.dailyEntryService.update(req.params.entryId, req.body);
        res.json(entry);
    }
    catch (error) {
        next(error);
    }
};
exports.updateEntry = updateEntry;
const deleteEntry = async (req, res, next) => {
    try {
        const result = await dailyEntry_service_1.dailyEntryService.delete(req.params.entryId);
        res.json(result);
    }
    catch (error) {
        next(error);
    }
};
exports.deleteEntry = deleteEntry;
const markDelivery = async (req, res, next) => {
    try {
        const entry = await dailyEntry_service_1.dailyEntryService.markDelivery(req.params.entryId, req.body);
        res.json(entry);
    }
    catch (error) {
        next(error);
    }
};
exports.markDelivery = markDelivery;
//# sourceMappingURL=dailyEntry.controller.js.map