import { Request, Response, NextFunction } from 'express';
import { adsService } from './ads.service';

export const listAds = async (_req: Request, res: Response, next: NextFunction) => {
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

export const createAd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ad = await adsService.create(req.body);
    res.status(201).json(ad);
  } catch (error) {
    next(error);
  }
};

export const updateAd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ad = await adsService.update(req.params.adId!, req.body);
    res.json(ad);
  } catch (error) {
    next(error);
  }
};

export const recordClick = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { adId } = req.params;
    if (!adId) {
      return res.status(400).json({ error: 'Ad ID is required' });
    }
    
    const userId = (req as any).user?.id;
    const userRole = (req as any).user?.role;

    console.log('[AdsController] Recording click for ad:', adId, 'userId:', userId, 'userRole:', userRole);
    
    const result = await adsService.recordClick(adId, userId, userRole);
    
    console.log('[AdsController] Click recorded successfully:', result);
    res.json({ success: true, ...result });
  } catch (error: any) {
    console.error('[AdsController] Error recording click:', error);
    next(error);
  }
};

export const listAllAds = async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const ads = await adsService.listAll();
    res.json(ads);
  } catch (error) {
    next(error);
  }
};

export const deleteAd = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await adsService.delete(req.params.adId!);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

export const getAdStats = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { adId } = req.params;
    if (!adId) {
      return res.status(400).json({ error: 'Ad ID is required' });
    }
    
    const { year, month } = req.query;

    let stats;
    if (year && month) {
      stats = await adsService.getMonthlyStats(adId, parseInt(year as string, 10), parseInt(month as string, 10));
    } else if (year) {
      stats = await adsService.getMonthlyStats(adId, parseInt(year as string, 10));
    } else {
      stats = await adsService.getAdStats(adId);
    }

    res.json(stats);
  } catch (error) {
    next(error);
  }
};
