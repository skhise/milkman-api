import { Router } from 'express';
import { createAd, listAds, listAllAds, updateAd, deleteAd, recordClick, getAdStats } from './ads.controller';
import { uploadAdImage } from './ads.upload';

const router = Router();

router.get('/', listAds); // List active ads (for public)
router.get('/all', listAllAds); // List all ads (for admin)
router.post('/upload', uploadAdImage); // Upload ad image
router.post('/', createAd);
router.put('/:adId', updateAd);
router.delete('/:adId', deleteAd);
router.post('/:adId/click', recordClick);
router.get('/:adId/stats', getAdStats);

export default router;
