"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAdStats = exports.recordClick = exports.updateAd = exports.createAd = exports.listAds = void 0;
const ads_service_1 = require("./ads.service");
const listAds = async (_req, res, next) => {
    try {
        console.log('[AdsController] listAds called');
        const ads = await ads_service_1.adsService.listActive();
        console.log('[AdsController] Returning', ads.length, 'ads');
        res.json(ads);
    }
    catch (error) {
        console.error('[AdsController] Error listing ads:', error);
        next(error);
    }
};
exports.listAds = listAds;
const createAd = async (req, res, next) => {
    try {
        const ad = await ads_service_1.adsService.create(req.body);
        res.status(201).json(ad);
    }
    catch (error) {
        next(error);
    }
};
exports.createAd = createAd;
const updateAd = async (req, res, next) => {
    try {
        const ad = await ads_service_1.adsService.update(req.params.adId, req.body);
        res.json(ad);
    }
    catch (error) {
        next(error);
    }
};
exports.updateAd = updateAd;
const recordClick = async (req, res, next) => {
    try {
        const { adId } = req.params;
        if (!adId) {
            return res.status(400).json({ error: 'Ad ID is required' });
        }
        const userId = req.user?.id;
        const userRole = req.user?.role;
        console.log('[AdsController] Recording click for ad:', adId, 'userId:', userId, 'userRole:', userRole);
        const result = await ads_service_1.adsService.recordClick(adId, userId, userRole);
        console.log('[AdsController] Click recorded successfully:', result);
        res.json({ success: true, ...result });
    }
    catch (error) {
        console.error('[AdsController] Error recording click:', error);
        next(error);
    }
};
exports.recordClick = recordClick;
const getAdStats = async (req, res, next) => {
    try {
        const { adId } = req.params;
        if (!adId) {
            return res.status(400).json({ error: 'Ad ID is required' });
        }
        const { year, month } = req.query;
        let stats;
        if (year && month) {
            stats = await ads_service_1.adsService.getMonthlyStats(adId, parseInt(year, 10), parseInt(month, 10));
        }
        else if (year) {
            stats = await ads_service_1.adsService.getMonthlyStats(adId, parseInt(year, 10));
        }
        else {
            stats = await ads_service_1.adsService.getAdStats(adId);
        }
        res.json(stats);
    }
    catch (error) {
        next(error);
    }
};
exports.getAdStats = getAdStats;
//# sourceMappingURL=ads.controller.js.map