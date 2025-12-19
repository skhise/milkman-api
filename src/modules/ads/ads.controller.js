import { adsService } from './ads.service.js';

export const listAds = async (_req, res, next) => {
  try {
    console.log('[AdsController] listAds called');
    const ads = await adsService.listActive();
    console.log('[AdsController] Returning', ads.length, 'ads');
    res.json(ads);
  } catch (error) {
    console.error('[AdsController] Error listing ads:', error);
    next(error);
  }
};

export const createAd = async (req, res, next) => {
  try {
    const ad = await adsService.create(req.body);
    res.status(201).json(ad);
  } catch (error) {
    next(error);
  }
};

export const updateAd = async (req, res, next) => {
  try {
    const ad = await adsService.update(req.params.adId, req.body);
    res.json(ad);
  } catch (error) {
    next(error);
  }
};

export const recordClick = async (req, res, next) => {
  try {
    const { adId } = req.params;
    if (!adId) {
      return res.status(400).json({ error: 'Ad ID is required' });
    }
    
    const userId = req.user?.id;
    const userRole = req.user?.role;

    console.log('[AdsController] Recording click for ad:', adId, 'userId:', userId, 'userRole:', userRole);
    
    const result = await adsService.recordClick(adId, userId, userRole);
    
    console.log('[AdsController] Click recorded successfully:', result);
    res.json({ success: true, ...result });
  } catch (error) {
    console.error('[AdsController] Error recording click:', error);
    next(error);
  }
};

export const listAllAds = async (_req, res, next) => {
  try {
    const ads = await adsService.listAll();
    res.json(ads);
  } catch (error) {
    next(error);
  }
};

export const deleteAd = async (req, res, next) => {
  try {
    const result = await adsService.delete(req.params.adId);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getAdStats = async (req, res, next) => {
  try {
    const { adId } = req.params;
    if (!adId) {
      return res.status(400).json({ error: 'Ad ID is required' });
    }
    
    const { year, month } = req.query;

    let stats;
    if (year && month) {
      stats = await adsService.getMonthlyStats(adId, parseInt(year, 10), parseInt(month, 10));
    } else if (year) {
      stats = await adsService.getMonthlyStats(adId, parseInt(year, 10));
    } else {
      stats = await adsService.getAdStats(adId);
    }

    res.json(stats);
  } catch (error) {
    next(error);
  }
};
